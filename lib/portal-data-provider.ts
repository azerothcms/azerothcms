import type { RowDataPacket } from "mysql2"

import { authDb, charactersDb, cmsDb } from "@/lib/db"
import { mockPortalDataProvider } from "@/lib/mock-data"
import type {
  AdminOverview,
  AdminUserSummary,
  CharacterSummary,
  ForumCategory,
  ForumThread,
  NewsArticle,
  PlayerProfile,
  PortalDataProvider,
  Realm,
  ShopProduct,
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

    return rows.map<Realm>((realm) => {
      const population = asNumber(realm.population)
      const type: Realm["type"] = realm.icon === 1 ? "PvP" : realm.icon === 6 ? "RP" : "PvE"
      const status: Realm["status"] = realm.flag & 0x02 ? "offline" : realm.flag & 0x01 ? "maintenance" : "online"

      return {
        id: `realm-${realm.id}`,
        slug: realm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `realm-${realm.id}`,
        name: realm.name,
        expansion: process.env.TRINITY_EXPANSION ?? "TrinityCore",
        type,
        status,
        onlinePlayers: Math.round(population * maxPlayers),
        maxPlayers,
        uptime: "实时数据",
        description: `来自 TrinityCore realmlist 的 ${realm.name} Realm。`,
      }
    })
  } catch (error) {
    console.error("Failed to read TrinityCore realms", error)
    return undefined
  }
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
    return readContent("news", () => mockPortalDataProvider.getNews())
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
    return readContent("forum_categories", () => mockPortalDataProvider.getForumCategories())
  },
  getForumThreads(): Promise<ForumThread[]> {
    return readContent("forum_threads", () => mockPortalDataProvider.getForumThreads())
  },
  async getForumThread(slug: string) {
    const threads = await this.getForumThreads()
    return threads.find((thread) => thread.slug === slug)
  },
  getShopProducts(): Promise<ShopProduct[]> {
    return readContent("shop_products", () => mockPortalDataProvider.getShopProducts())
  },
  async getShopProduct(slug: string) {
    const products = await this.getShopProducts()
    return products.find((product) => product.slug === slug)
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
