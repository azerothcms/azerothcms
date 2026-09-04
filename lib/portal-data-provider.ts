import type { RowDataPacket } from "mysql2"

import { authDb, charactersDb, cmsDb } from "@/lib/db"
import { mockPortalDataProvider } from "@/lib/mock-data"
import type {
  AdminOverview,
  AdminUserSummary,
  CharacterSummary,
  ForumCategory,
  ForumReply,
  ForumThread,
  NewsArticle,
  PlayerProfile,
  PortalDataProvider,
  Realm,
  ShopProduct,
  ShopOrderSummary,
  AdminShopOrderSummary,
} from "@/lib/types"

interface ContentRow extends RowDataPacket {
  payload: unknown
}

interface RealmRow extends RowDataPacket {
  id: number
  name: string
  icon: number
  flag: number
  population: number | string
  gamebuild: number
}

interface RealmOverrideRow extends RowDataPacket {
  realm_id: number
  status: Realm["status"] | null
  description: string | null
}

interface NewsRow extends RowDataPacket {
  id: string
  slug: string
  title: string
  category: NewsArticle["category"]
  excerpt: string
  content: unknown
  published_at: Date | string
  read_time: string
  featured: number
  accent: NewsArticle["accent"]
  status: NewsArticle["status"]
}

interface ForumCategoryRow extends RowDataPacket {
  id: string
  slug: string
  name: string
  description: string
  accent: ForumCategory["accent"]
  thread_count: number | string
  latest_thread: string | null
}

interface ForumThreadRow extends RowDataPacket {
  id: string
  slug: string
  category_slug: string
  category_name: string
  author_account_id: number | null
  title: string
  excerpt: string
  body: unknown
  tags: unknown
  is_pinned: number
  is_hot: number
  view_count: number | string
  replies: number | string
  created_at: Date | string
  updated_at: Date | string
}

interface ForumReplyRow extends RowDataPacket {
  id: number | string
  author_account_id: number
  body: string
  created_at: Date | string
}

interface ShopProductRow extends RowDataPacket {
  id: string
  slug: string
  name: string
  category: ShopProduct["category"]
  description: string
  details: unknown
  price: number | string
  currency: string
  accent: ShopProduct["accent"]
  featured: number
}

interface ShopOrderRow extends RowDataPacket {
  id: number | string
  status: ShopOrderSummary["status"]
  total: number | string
  currency: string
  created_at: Date | string
  items: string | null
}

interface AdminShopOrderRow extends ShopOrderRow {
  account_id: number
}

interface AccountLookupRow extends RowDataPacket {
  id: number
  username: string
  email: string
}

interface CharacterRow extends RowDataPacket {
  guid: number | string
  account: number
  name: string | null
  race: number
  class: number
  level: number
  online: number
  health: number | string
  power1: number | string
  totaltime: number | string
}

interface AccountRow extends RowDataPacket {
  id: number
  username: string
  email: string
  joindate: Date | string
  locked: number
  last_login: Date | string | null
  securityLevel: number
}

type ContentKey =
  | "realms"
  | "news"
  | "characters"
  | "player_profile"
  | "forum_categories"
  | "forum_threads"
  | "shop_products"
  | "admin_overview"
  | "admin_users"

function parsePayload<T>(payload: unknown): T | undefined {
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload) as T
    } catch {
      return undefined
    }
  }

  return payload as T | undefined
}

function parseStringArray(value: unknown) {
  const parsed = parsePayload<unknown>(value)

  if (Array.isArray(parsed)) {
    return parsed.filter((item): item is string => typeof item === "string")
  }

  return typeof parsed === "string" ? [parsed] : []
}

async function readContent<T>(key: ContentKey, fallback: () => Promise<T>): Promise<T> {
  try {
    const [rows] = await cmsDb.execute<ContentRow[]>(
      "SELECT payload FROM cms WHERE content_key = ? LIMIT 1",
      [key]
    )
    const payload = rows[0] ? parsePayload<T>(rows[0].payload) : undefined

    return payload ?? fallback()
  } catch (error) {
    const code = (error as { code?: string }).code

    if (
      !code ||
      ![
        "ER_BAD_DB_ERROR",
        "ER_NO_SUCH_TABLE",
        "ER_ACCESS_DENIED_ERROR",
        "ER_DBACCESS_DENIED_ERROR",
        "ER_TABLEACCESS_DENIED_ERROR",
      ].includes(code)
    ) {
      console.error(`Failed to read CMS content: ${key}`, error)
    }

    return fallback()
  }
}

function asNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatPlayTime(seconds: number | string) {
  const totalHours = Math.floor(asNumber(seconds) / 3600)
  return `${Math.floor(totalHours / 24)} 天 ${totalHours % 24} 小时`
}

function factionForRace(race: number): "Alliance" | "Horde" {
  return [2, 5, 6, 8, 10].includes(race) ? "Horde" : "Alliance"
}

function classNameForId(classId: number) {
  return (
    {
      1: "战士",
      2: "圣骑士",
      3: "猎人",
      4: "盗贼",
      5: "牧师",
      6: "死亡骑士",
      7: "萨满祭司",
      8: "法师",
      9: "术士",
      11: "德鲁伊",
    } as Record<number, string>
  )[classId] ?? `职业 ${classId}`
}

function isDatabaseConfigurationError(error: unknown) {
  const code = (error as { code?: string }).code
  return [
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
    "ER_ACCESS_DENIED_ERROR",
    "ER_DBACCESS_DENIED_ERROR",
    "ER_TABLEACCESS_DENIED_ERROR",
  ].includes(code ?? "")
}

function emptyPlayerProfile(accountId: number): PlayerProfile {
  return {
    username: `Account ${accountId}`,
    email: "",
    faction: "Alliance",
    memberSince: "-",
    gameAccounts: [],
    characters: [],
  }
}

async function getLiveRealms(): Promise<Realm[] | undefined> {
  try {
    const [rows] = await authDb.execute<RealmRow[]>(
      `SELECT id, name, icon, flag, population, gamebuild
       FROM realmlist
       ORDER BY name`
    )

    if (!rows.length) {
      return undefined
    }

    const maxPlayers = Number(process.env.REALM_MAX_PLAYERS ?? "2000")
    const overrides = await getRealmOverrides(rows.map((realm) => realm.id))

    return rows.map<Realm>((realm) => {
      const population = asNumber(realm.population)
      const type: Realm["type"] = realm.icon === 1 ? "PvP" : realm.icon === 6 ? "RP" : "PvE"
      const defaultStatus: Realm["status"] = realm.flag & 0x02 ? "offline" : realm.flag & 0x01 ? "maintenance" : "online"
      const override = overrides.get(realm.id)

      return {
        id: `realm-${realm.id}`,
        slug: realm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `realm-${realm.id}`,
        name: realm.name,
        expansion: process.env.TRINITY_EXPANSION ?? "TrinityCore",
        type,
        status: override?.status ?? defaultStatus,
        onlinePlayers: Math.round(population * maxPlayers),
        maxPlayers,
        uptime: "实时数据",
        description: override?.description ?? `来自 TrinityCore realmlist 的 ${realm.name} Realm。`,
      }
    })
  } catch (error) {
    console.error("Failed to read TrinityCore realms", error)
    return undefined
  }
}

async function getRealmOverrides(realmIds: number[]) {
  const overrides = new Map<number, RealmOverrideRow>()

  if (!realmIds.length) {
    return overrides
  }

  try {
    const placeholders = realmIds.map(() => "?").join(",")
    const [rows] = await cmsDb.execute<RealmOverrideRow[]>(
      `SELECT realm_id, status, description
       FROM realm_override
       WHERE realm_id IN (${placeholders})`,
      realmIds
    )

    for (const row of rows) {
      overrides.set(row.realm_id, row)
    }
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS realm overrides", error)
    }
  }

  return overrides
}

async function getLiveCharacters(accountId?: number): Promise<CharacterSummary[] | undefined> {
  try {
    const [rows] = await charactersDb.execute<CharacterRow[]>(
      `SELECT guid, account, name, race, class, level, online, health, power1, totaltime
       FROM characters
       ${accountId ? "WHERE account = ?" : ""}
       ORDER BY level DESC, name`,
      accountId ? [accountId] : []
    )
    const realms = await getLiveRealms()
    const realm = realms?.[0]

    return rows.map<CharacterSummary>((character) => {
      const faction = factionForRace(character.race)
      const avatarTone: CharacterSummary["avatarTone"] = faction === "Horde" ? "red" : "gold"

      return {
        id: String(character.guid),
        name: character.name ?? `角色 ${character.guid}`,
        realmId: realm?.id ?? "realm-unknown",
        realmName: realm?.name ?? "TrinityCore",
        race: `种族 ${character.race}`,
        className: classNameForId(character.class),
        faction,
        level: character.level,
        guild: "未加入公会",
        itemLevel: 0,
        lastSeen: character.online ? "在线" : "离线",
        avatarTone,
        stats: {
          health: asNumber(character.health).toLocaleString(),
          power: asNumber(character.power1).toLocaleString(),
          achievementPoints: 0,
          playTime: formatPlayTime(character.totaltime),
        },
        gear: [],
      }
    })
  } catch (error) {
    console.error("Failed to read TrinityCore characters", error)
    return undefined
  }
}

async function getLiveNews(includeDrafts = false): Promise<NewsArticle[] | undefined> {
  try {
    const [rows] = await cmsDb.execute<NewsRow[]>(
      `SELECT id, slug, title, category, excerpt, content, published_at,
              read_time, featured, accent, status
       FROM news_article
       ${includeDrafts ? "" : "WHERE status = 'published'"}
       ORDER BY published_at DESC, created_at DESC`
    )

    if (!rows.length) {
      return undefined
    }

    return rows.map<NewsArticle>((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      content: parseStringArray(article.content),
      publishedAt: String(article.published_at).slice(0, 10),
      readTime: article.read_time,
      featured: Boolean(article.featured),
      accent: article.accent,
      status: article.status ?? "published",
    }))
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS news articles", error)
    }

    return undefined
  }
}

async function getLiveForumCategories(): Promise<ForumCategory[] | undefined> {
  try {
    const [rows] = await cmsDb.execute<ForumCategoryRow[]>(
      `SELECT c.id, c.slug, c.name, c.description, c.accent,
              COUNT(t.id) AS thread_count,
              (SELECT latest.title
               FROM forum_thread latest
               WHERE latest.category_id = c.id
               ORDER BY latest.updated_at DESC
               LIMIT 1) AS latest_thread
       FROM forum_category c
       LEFT JOIN forum_thread t ON t.category_id = c.id
       GROUP BY c.id, c.slug, c.name, c.description, c.accent, c.created_at
       ORDER BY c.created_at`
    )

    if (!rows.length) {
      return undefined
    }

    return rows.map<ForumCategory>((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      accent: category.accent,
      threadCount: Number(category.thread_count),
      latestThread: category.latest_thread ?? "暂无主题",
    }))
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS forum categories", error)
    }

    return undefined
  }
}

async function getLiveForumThreads(): Promise<ForumThread[] | undefined> {
  try {
    const [rows] = await cmsDb.execute<ForumThreadRow[]>(
      `SELECT c.slug AS category_slug, c.name AS category_name,
              t.id, t.slug, t.author_account_id, t.title, t.excerpt,
              t.body, t.tags, t.is_pinned, t.is_hot, t.view_count,
              (SELECT COUNT(*) FROM forum_reply r WHERE r.thread_id = t.id) AS replies,
              t.created_at, t.updated_at
       FROM forum_thread t
       INNER JOIN forum_category c ON c.id = t.category_id
       ORDER BY t.is_pinned DESC, t.updated_at DESC`
    )

    if (!rows.length) {
      return undefined
    }

    return rows.map<ForumThread>((thread) => ({
      id: thread.id,
      slug: thread.slug,
      categorySlug: thread.category_slug,
      categoryName: thread.category_name,
      title: thread.title,
      excerpt: thread.excerpt,
      author: thread.author_account_id ? `玩家 ${thread.author_account_id}` : "社区成员",
      authorRole: thread.author_account_id ? "社区成员" : "官方团队",
      replies: Number(thread.replies),
      views: Number(thread.view_count),
      lastActivity: String(thread.updated_at),
      createdAt: String(thread.created_at),
      isPinned: Boolean(thread.is_pinned),
      isHot: Boolean(thread.is_hot),
      tags: parseStringArray(thread.tags),
      body: parseStringArray(thread.body),
    }))
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS forum threads", error)
    }

    return undefined
  }
}

async function getLiveForumThread(slug: string): Promise<ForumThread | undefined> {
  const threads = await getLiveForumThreads()
  const thread = threads?.find((candidate) => candidate.slug === slug)

  if (!thread) {
    return undefined
  }

  try {
    const [rows] = await cmsDb.execute<ForumReplyRow[]>(
      `SELECT id, author_account_id, body, created_at
       FROM forum_reply
       WHERE thread_id = ?
       ORDER BY created_at ASC, id ASC`,
      [thread.id]
    )

    return {
      ...thread,
      repliesList: rows.map<ForumReply>((reply) => ({
        id: String(reply.id),
        author: `玩家 ${reply.author_account_id}`,
        content: reply.body,
        createdAt: String(reply.created_at),
      })),
    }
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS forum replies", error)
    }

    return { ...thread, repliesList: [] }
  }
}

async function getLiveShopProducts(): Promise<ShopProduct[] | undefined> {
  try {
    const [rows] = await cmsDb.execute<ShopProductRow[]>(
      `SELECT id, slug, name, category, description, details, price,
              currency, accent, featured
       FROM shop_product
       WHERE active = TRUE
       ORDER BY featured DESC, created_at DESC`
    )

    if (!rows.length) {
      return undefined
    }

    return rows.map<ShopProduct>((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      description: product.description,
      details: parseStringArray(product.details),
      price: Number(product.price),
      currency: product.currency,
      accent: product.accent,
      featured: Boolean(product.featured),
    }))
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS shop products", error)
    }

    return undefined
  }
}

async function getLiveShopOrders(accountId: number): Promise<ShopOrderSummary[] | undefined> {
  try {
    const [rows] = await cmsDb.execute<ShopOrderRow[]>(
      `SELECT o.id, o.status, o.total, o.currency, o.created_at,
              GROUP_CONCAT(
                CONCAT(COALESCE(p.name, i.product_id), ' × ', i.quantity)
                ORDER BY i.id SEPARATOR '、'
              ) AS items
       FROM shop_order o
       INNER JOIN shop_order_item i ON i.order_id = o.id
       LEFT JOIN shop_product p ON p.id = i.product_id
       WHERE o.account_id = ?
       GROUP BY o.id, o.status, o.total, o.currency, o.created_at
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [accountId]
    )

    return rows.map<ShopOrderSummary>((order) => ({
      id: String(order.id),
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      createdAt: String(order.created_at),
      items: order.items ?? "订单明细不可用",
    }))
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS shop orders", error)
    }

    return undefined
  }
}

async function getLiveAdminShopOrders(): Promise<AdminShopOrderSummary[] | undefined> {
  try {
    const [rows] = await cmsDb.execute<AdminShopOrderRow[]>(
      `SELECT o.id, o.account_id, o.status, o.total, o.currency, o.created_at,
              GROUP_CONCAT(
                CONCAT(COALESCE(p.name, i.product_id), ' × ', i.quantity)
                ORDER BY i.id SEPARATOR '、'
              ) AS items
       FROM shop_order o
       INNER JOIN shop_order_item i ON i.order_id = o.id
       LEFT JOIN shop_product p ON p.id = i.product_id
       GROUP BY o.id, o.account_id, o.status, o.total, o.currency, o.created_at
       ORDER BY o.created_at DESC
       LIMIT 100`
    )

    if (!rows.length) {
      return []
    }

    const accountIds = [...new Set(rows.map((order) => order.account_id))]
    const placeholders = accountIds.map(() => "?").join(",")
    const [accounts] = await authDb.execute<AccountLookupRow[]>(
      `SELECT id, username, email FROM account WHERE id IN (${placeholders})`,
      accountIds
    )
    const accountMap = new Map(accounts.map((account) => [account.id, account]))

    return rows.map<AdminShopOrderSummary>((order) => {
      const account = accountMap.get(order.account_id)

      return {
        id: String(order.id),
        accountId: order.account_id,
        username: account?.username ?? `账号 ${order.account_id}`,
        email: account?.email ?? "",
        status: order.status,
        total: Number(order.total),
        currency: order.currency,
        createdAt: String(order.created_at),
        items: order.items ?? "订单明细不可用",
      }
    })
  } catch (error) {
    if (!isDatabaseConfigurationError(error)) {
      console.error("Failed to read CMS admin shop orders", error)
    }

    return undefined
  }
}

async function getLiveProfile(accountId: number): Promise<PlayerProfile | undefined> {
  try {
    const [accounts] = await authDb.execute<AccountRow[]>(
      `SELECT a.id, a.username, a.email, a.joindate, a.locked, a.last_login,
              COALESCE(MAX(aa.SecurityLevel), 0) AS securityLevel
       FROM account a
       LEFT JOIN account_access aa ON aa.AccountID = a.id
       WHERE a.id = ?
       GROUP BY a.id, a.username, a.email, a.joindate, a.locked, a.last_login`,
      [accountId]
    )
    const account = accounts[0]

    if (!account) {
      return undefined
    }

    const characters = (await getLiveCharacters(accountId)) ?? []
    const memberSince = String(account.joindate).slice(0, 10)

    return {
      username: account.username,
      email: account.email,
      faction: characters[0]?.faction ?? "Alliance",
      memberSince,
      gameAccounts: [
        {
          id: `account-${account.id}`,
          username: account.username.toLowerCase(),
          expansion: process.env.TRINITY_EXPANSION ?? "TrinityCore",
          status: account.locked ? "locked" : "active",
          characterCount: characters.length,
          lastLogin: account.last_login ? String(account.last_login) : "尚未登录",
        },
      ],
      characters,
    }
  } catch (error) {
    console.error("Failed to read TrinityCore account profile", error)
    return undefined
  }
}

async function getLiveAdminUsers(): Promise<AdminUserSummary[] | undefined> {
  try {
    const [accounts] = await authDb.execute<AccountRow[]>(
      `SELECT a.id, a.username, a.email, a.joindate, a.locked, a.last_login,
              COALESCE(MAX(aa.SecurityLevel), 0) AS securityLevel
       FROM account a
       LEFT JOIN account_access aa ON aa.AccountID = a.id
       GROUP BY a.id, a.username, a.email, a.joindate, a.locked, a.last_login
       ORDER BY a.id DESC`
    )
    const [characterCounts] = await charactersDb.execute<RowDataPacket[]>(
      "SELECT account, COUNT(*) AS count FROM characters GROUP BY account"
    )
    const counts = new Map(characterCounts.map((row) => [Number(row.account), Number(row.count)]))

    return accounts.map<AdminUserSummary>((account) => ({
      id: `user-${account.id}`,
      username: account.username,
      email: account.email,
      role: account.securityLevel >= 3 ? "管理员" : "玩家",
      status: account.locked ? "已暂停" : account.email ? "正常" : "待验证",
      characters: counts.get(account.id) ?? 0,
      lastActive: account.last_login ? String(account.last_login) : "从未登录",
    }))
  } catch (error) {
    console.error("Failed to read TrinityCore admin users", error)
    return undefined
  }
}

async function getLiveAdminOverview(): Promise<AdminOverview | undefined> {
  try {
    const [accountResult, characterResult] = await Promise.all([
      authDb.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS totalPlayers,
                SUM(CASE WHEN online = 1 THEN 1 ELSE 0 END) AS onlinePlayers
         FROM account`
      ),
      charactersDb.execute<RowDataPacket[]>("SELECT COUNT(*) AS totalCharacters FROM characters"),
    ])
    const accountStats = accountResult[0][0]
    const characterStats = characterResult[0][0]

    return {
      totalPlayers: Number(accountStats?.totalPlayers ?? 0),
      onlinePlayers: Number(accountStats?.onlinePlayers ?? 0),
      totalCharacters: Number(characterStats?.totalCharacters ?? 0),
      pendingReports: 0,
      revenueThisMonth: "0 点券",
    }
  } catch (error) {
    console.error("Failed to read TrinityCore admin overview", error)
    return undefined
  }
}

export const portalDataProvider = {
  getRealms(): Promise<Realm[]> {
    return getLiveRealms().then((realms) => realms ?? mockPortalDataProvider.getRealms())
  },
  getNews(): Promise<NewsArticle[]> {
    return getLiveNews().then((news) => news ?? readContent("news", () => mockPortalDataProvider.getNews()))
  },
  getAdminNews(): Promise<NewsArticle[]> {
    return getLiveNews(true).then((news) => news ?? readContent("news", () => mockPortalDataProvider.getNews()))
  },
  async getNewsArticle(slug: string) {
    const articles = await this.getNews()
    return articles.find((article) => article.slug === slug)
  },
  getCharacters(): Promise<CharacterSummary[]> {
    return getLiveCharacters().then((characters) => characters ?? readContent("characters", () => mockPortalDataProvider.getCharacters()))
  },
  async getCharacter(id: string) {
    const characters = await this.getCharacters()
    return characters.find((character) => character.id === id)
  },
  async getPlayerProfile(accountId?: number): Promise<PlayerProfile> {
    if (accountId) {
      const profile = await getLiveProfile(accountId)

      if (profile) {
        return profile
      }

      return emptyPlayerProfile(accountId)
    }

    return readContent("player_profile", () => mockPortalDataProvider.getPlayerProfile(accountId))
  },
  getForumCategories(): Promise<ForumCategory[]> {
    return getLiveForumCategories().then((categories) => categories ?? readContent("forum_categories", () => mockPortalDataProvider.getForumCategories()))
  },
  getForumThreads(): Promise<ForumThread[]> {
    return getLiveForumThreads().then((threads) => threads ?? readContent("forum_threads", () => mockPortalDataProvider.getForumThreads()))
  },
  async getForumThread(slug: string) {
    const liveThread = await getLiveForumThread(slug)

    if (liveThread) {
      return liveThread
    }

    const threads = await this.getForumThreads()
    return threads.find((thread) => thread.slug === slug)
  },
  getShopProducts(): Promise<ShopProduct[]> {
    return getLiveShopProducts().then((products) => products ?? readContent("shop_products", () => mockPortalDataProvider.getShopProducts()))
  },
  async getShopProduct(slug: string) {
    const products = await this.getShopProducts()
    return products.find((product) => product.slug === slug)
  },
  getShopOrders(accountId: number): Promise<ShopOrderSummary[]> {
    return getLiveShopOrders(accountId).then((orders) => orders ?? [])
  },
  getAdminShopOrders(): Promise<AdminShopOrderSummary[]> {
    return getLiveAdminShopOrders().then((orders) => orders ?? [])
  },
  async getAdminOverview(): Promise<AdminOverview> {
    const overview = await getLiveAdminOverview()
    return overview ?? readContent("admin_overview", () => mockPortalDataProvider.getAdminOverview())
  },
  async getAdminUsers(): Promise<AdminUserSummary[]> {
    const users = await getLiveAdminUsers()
    return users ?? readContent("admin_users", () => mockPortalDataProvider.getAdminUsers())
  },
} satisfies PortalDataProvider
