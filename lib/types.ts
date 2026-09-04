export type RealmStatus = "online" | "offline" | "maintenance"

export type Faction = "Alliance" | "Horde"

export interface Realm {
  id: string
  slug: string
  name: string
  expansion: string
  type: "PvE" | "PvP" | "RP"
  status: RealmStatus
  onlinePlayers: number
  maxPlayers: number
  uptime: string
  description: string
}

export interface NewsArticle {
  id: string
  slug: string
  title: string
  category: "公告" | "活动" | "社区"
  excerpt: string
  content: string[]
  publishedAt: string
  readTime: string
  featured: boolean
  accent: "gold" | "blue" | "purple"
  status?: "draft" | "published"
}

export interface GearItem {
  slot: string
  name: string
  itemLevel: number
  tone: "gold" | "blue" | "purple" | "green"
}

export interface CharacterSummary {
  id: string
  name: string
  realmId: string
  realmName: string
  race: string
  className: string
  faction: Faction
  level: number
  guild: string
  itemLevel: number
  lastSeen: string
  avatarTone: "gold" | "blue" | "red"
  stats: {
    health: string
    power: string
    achievementPoints: number
    playTime: string
  }
  gear: GearItem[]
}

export interface GameAccount {
  id: string
  username: string
  expansion: string
  status: "active" | "locked"
  characterCount: number
  lastLogin: string
}

export interface PlayerProfile {
  username: string
  email: string
  faction: Faction
  memberSince: string
  gameAccounts: GameAccount[]
  characters: CharacterSummary[]
}

export interface ForumCategory {
  id: string
  slug: string
  name: string
  description: string
  threadCount: number
  latestThread: string
  accent: "gold" | "blue" | "purple" | "green"
}

export interface ForumThread {
  id: string
  slug: string
  categorySlug: string
  categoryName: string
  title: string
  excerpt: string
  author: string
  authorRole: string
  replies: number
  views: number
  lastActivity: string
  createdAt: string
  isPinned?: boolean
  isHot?: boolean
  tags: string[]
  body: string[]
}

export type ShopProductCategory = "账号服务" | "外观收藏" | "坐骑伙伴"

export interface ShopProduct {
  id: string
  slug: string
  name: string
  category: ShopProductCategory
  description: string
  details: string[]
  price: number
  currency: string
  accent: "gold" | "blue" | "purple" | "green"
  featured?: boolean
}

export interface AdminOverview {
  totalPlayers: number
  onlinePlayers: number
  totalCharacters: number
  pendingReports: number
  revenueThisMonth: string
}

export interface AdminUserSummary {
  id: string
  username: string
  email: string
  role: "管理员" | "玩家"
  status: "正常" | "待验证" | "已暂停"
  characters: number
  lastActive: string
}

export interface SessionState {
  authenticated: boolean
  accountId?: number
  username?: string
  email?: string
  role?: "admin" | "player"
}

export type SetupCheckState = "ready" | "missing" | "error"

export interface SetupCheck {
  state: SetupCheckState
  database: string
  message: string
}

export interface SetupStatus {
  setupRequired: boolean
  auth: SetupCheck & {
    accounts: number
    admins: number
    realms: number
  }
  cms: SetupCheck
}

export interface PortalDataProvider {
  getRealms(): Promise<Realm[]>
  getNews(): Promise<NewsArticle[]>
  getAdminNews(): Promise<NewsArticle[]>
  getNewsArticle(slug: string): Promise<NewsArticle | undefined>
  getCharacters(): Promise<CharacterSummary[]>
  getCharacter(id: string): Promise<CharacterSummary | undefined>
  getPlayerProfile(accountId?: number): Promise<PlayerProfile>
  getForumCategories(): Promise<ForumCategory[]>
  getForumThreads(): Promise<ForumThread[]>
  getForumThread(slug: string): Promise<ForumThread | undefined>
  getShopProducts(): Promise<ShopProduct[]>
  getShopProduct(slug: string): Promise<ShopProduct | undefined>
  getAdminOverview(): Promise<AdminOverview>
  getAdminUsers(): Promise<AdminUserSummary[]>
}
