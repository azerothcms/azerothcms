import type {
  AdminOverview,
  AdminUserSummary,
  CharacterSummary,
  ForumCategory,
  ForumThread,
  NewsArticle,
  PortalDataProvider,
  PlayerProfile,
  Realm,
  ShopProduct,
} from "@/lib/types"

const realms: Realm[] = [
  {
    id: "realm-azurehold",
    slug: "azurehold",
    name: "Azurehold",
    expansion: "巫妖王之怒",
    type: "PvP",
    status: "online",
    onlinePlayers: 1423,
    maxPlayers: 2000,
    uptime: "99.98%",
    description: "高峰期活跃的经典 PvP 服务器，适合喜欢开放世界对抗的冒险者。",
  },
  {
    id: "realm-moonshade",
    slug: "moonshade",
    name: "Moonshade",
    expansion: "巫妖王之怒",
    type: "PvE",
    status: "online",
    onlinePlayers: 876,
    maxPlayers: 1500,
    uptime: "99.95%",
    description: "为团队副本与长期公会协作准备的稳定 PvE 服务器。",
  },
  {
    id: "realm-stormspire",
    slug: "stormspire",
    name: "Stormspire",
    expansion: "燃烧的远征",
    type: "RP",
    status: "maintenance",
    onlinePlayers: 0,
    maxPlayers: 1000,
    uptime: "98.72%",
    description: "经典燃烧的远征体验，正在进行例行维护与内容更新。",
  },
  {
    id: "realm-frostwake",
    slug: "frostwake",
    name: "Frostwake",
    expansion: "经典旧世",
    type: "PvE",
    status: "offline",
    onlinePlayers: 0,
    maxPlayers: 1200,
    uptime: "99.12%",
    description: "面向经典旧世玩家的 PvE Realm，当前暂时离线，等待服务恢复。",
  },
]

const news: NewsArticle[] = [
  {
    id: "news-season-2",
    slug: "season-two-begins",
    title: "第二赛季：北境的号角已经吹响",
    category: "公告",
    excerpt: "全新赛季正式开启，新的奖励、首领与战场等待着最勇敢的冒险者。",
    content: [
      "北境的风雪再次席卷大地。第二赛季现已开放，所有玩家都可以从熟悉的城镇出发，追寻新的挑战。",
      "本赛季新增了赛季成就、限时活动与一组全新的装备外观。服务器将在高峰时段保持稳定开放，祝各位冒险者好运。",
    ],
    publishedAt: "2026-09-03",
    readTime: "3 分钟阅读",
    featured: true,
    accent: "gold",
  },
  {
    id: "news-raid-night",
    slug: "community-raid-night",
    title: "社区团队副本夜报名开启",
    category: "社区",
    excerpt: "每周五晚，和服务器中的伙伴一起挑战经典团队副本。",
    content: [
      "社区团队副本夜将于本周五晚间开启。无论你是第一次挑战，还是希望带领团队突破记录，都欢迎加入活动。",
      "报名信息会在活动开始前更新到社区频道，记得准备好药剂、食物和你的团队口号。",
    ],
    publishedAt: "2026-09-01",
    readTime: "2 分钟阅读",
    featured: false,
    accent: "blue",
  },
  {
    id: "news-maintenance",
    slug: "scheduled-maintenance",
    title: "9 月 5 日服务器维护公告",
    category: "公告",
    excerpt: "Stormspire 将进行版本更新与数据库维护，预计持续 30 分钟。",
    content: [
      "Stormspire 将于 9 月 5 日 04:00 至 04:30 进行例行维护。维护期间该 Realm 将暂时无法登录。",
      "本次维护包含安全补丁、性能优化以及下一轮内容活动的准备工作。",
    ],
    publishedAt: "2026-08-30",
    readTime: "1 分钟阅读",
    featured: false,
    accent: "purple",
  },
  {
    id: "news-welcome",
    slug: "welcome-to-azeroth",
    title: "欢迎来到 Azeroth CMS",
    category: "活动",
    excerpt: "新玩家指南、社区守则与服务器入门信息现已整理完毕。",
    content: [
      "欢迎来到 Azeroth。我们希望为每一位玩家提供稳定、友好且充满探索感的经典世界。",
      "你可以从服务器状态页开始，了解各个 Realm 的当前状态，再前往玩家中心管理游戏账号。",
    ],
    publishedAt: "2026-08-26",
    readTime: "2 分钟阅读",
    featured: false,
    accent: "blue",
  },
]

const characters: CharacterSummary[] = [
  {
    id: "char-arya",
    name: "Arya",
    realmId: "realm-azurehold",
    realmName: "Azurehold",
    race: "人类",
    className: "圣骑士",
    faction: "Alliance",
    level: 80,
    guild: "银色黎明",
    itemLevel: 245,
    lastSeen: "12 分钟前",
    avatarTone: "gold",
    stats: {
      health: "24,860",
      power: "1,840",
      achievementPoints: 12840,
      playTime: "48 天 7 小时",
    },
    gear: [
      { slot: "头部", name: "寒冰皇冠", itemLevel: 245, tone: "gold" },
      { slot: "胸部", name: "银色卫士胸甲", itemLevel: 245, tone: "blue" },
      { slot: "武器", name: "光明审判之锤", itemLevel: 252, tone: "purple" },
      { slot: "饰品", name: "无尽勇气徽记", itemLevel: 239, tone: "green" },
    ],
  },
  {
    id: "char-kael",
    name: "Kaelthas",
    realmId: "realm-moonshade",
    realmName: "Moonshade",
    race: "血精灵",
    className: "法师",
    faction: "Horde",
    level: 80,
    guild: "星辰议会",
    itemLevel: 239,
    lastSeen: "1 小时前",
    avatarTone: "red",
    stats: {
      health: "18,420",
      power: "3,260",
      achievementPoints: 9460,
      playTime: "31 天 12 小时",
    },
    gear: [
      { slot: "头部", name: "奥术回响兜帽", itemLevel: 239, tone: "purple" },
      { slot: "胸部", name: "星界织法长袍", itemLevel: 239, tone: "blue" },
      { slot: "武器", name: "霜火秘典", itemLevel: 245, tone: "gold" },
      { slot: "饰品", name: "燃烧的符文", itemLevel: 232, tone: "green" },
    ],
  },
  {
    id: "char-thorne",
    name: "Thorne",
    realmId: "realm-azurehold",
    realmName: "Azurehold",
    race: "矮人",
    className: "战士",
    faction: "Alliance",
    level: 80,
    guild: "铁炉堡远征队",
    itemLevel: 232,
    lastSeen: "昨天",
    avatarTone: "blue",
    stats: {
      health: "29,760",
      power: "1,220",
      achievementPoints: 7320,
      playTime: "19 天 2 小时",
    },
    gear: [
      { slot: "头部", name: "山脉壁垒", itemLevel: 232, tone: "blue" },
      { slot: "胸部", name: "铁砧重甲", itemLevel: 232, tone: "green" },
      { slot: "武器", name: "熔火战斧", itemLevel: 239, tone: "gold" },
      { slot: "饰品", name: "坚毅之心", itemLevel: 225, tone: "purple" },
    ],
  },
]

const playerProfile: PlayerProfile = {
  username: "Admin",
  email: "admin@admin.com",
  faction: "Alliance",
  memberSince: "2025 年 11 月",
  gameAccounts: [
    {
      id: "account-main",
      username: "admin",
      expansion: "巫妖王之怒",
      status: "active",
      characterCount: 2,
      lastLogin: "今天 09:42",
    },
    {
      id: "account-classic",
      username: "admin_classic",
      expansion: "燃烧的远征",
      status: "active",
      characterCount: 1,
      lastLogin: "昨天 21:10",
    },
  ],
  characters,
}

const forumCategories: ForumCategory[] = [
  {
    id: "forum-general",
    slug: "general",
    name: "综合讨论",
    description: "聊聊服务器、职业选择和你在艾泽拉斯遇到的一切。",
    threadCount: 128,
    latestThread: "第二赛季，你最期待哪个副本？",
    accent: "gold",
  },
  {
    id: "forum-guides",
    slug: "guides",
    name: "攻略心得",
    description: "分享职业配装、副本机制与值得收藏的冒险路线。",
    threadCount: 86,
    latestThread: "圣骑士前期升级路线分享",
    accent: "blue",
  },
  {
    id: "forum-community",
    slug: "community",
    name: "公会与活动",
    description: "寻找伙伴、发布活动，组建属于你的远征队。",
    threadCount: 54,
    latestThread: "周五团队副本夜招募长期成员",
    accent: "purple",
  },
  {
    id: "forum-support",
    slug: "support",
    name: "问题反馈",
    description: "反馈客户端、Realm 与账号使用过程中遇到的问题。",
    threadCount: 32,
    latestThread: "Stormspire 维护期间无法登录",
    accent: "green",
  },
]

const forumThreads: ForumThread[] = [
  {
    id: "thread-season-two",
    slug: "season-two-dungeon-picks",
    categorySlug: "general",
    categoryName: "综合讨论",
    title: "第二赛季，你最期待哪个副本？",
    excerpt: "新的首领与战场已经开放，来聊聊你的队伍准备从哪里开始。",
    author: "Elowen",
    authorRole: "社区成员",
    replies: 24,
    views: 2180,
    lastActivity: "8 分钟前",
    createdAt: "2026-09-03 18:24",
    isPinned: true,
    isHot: true,
    tags: ["第二赛季", "副本"],
    body: [
      "第二赛季已经开启，大家准备先挑战哪个副本？我们公会目前在整理队伍配置，也欢迎新朋友一起讨论。",
      "如果你有特别喜欢的首领机制或奖励外观，也可以在这里留下你的期待。",
    ],
  },
  {
    id: "thread-paladin-route",
    slug: "paladin-leveling-route",
    categorySlug: "guides",
    categoryName: "攻略心得",
    title: "圣骑士前期升级路线分享",
    excerpt: "从新手村到北境的路线整理，适合刚开始冒险的圣骑士。",
    author: "Arya",
    authorRole: "攻略作者",
    replies: 16,
    views: 1460,
    lastActivity: "35 分钟前",
    createdAt: "2026-09-02 11:05",
    isHot: true,
    tags: ["圣骑士", "升级"],
    body: [
      "这是一条以任务和副本交替为主的升级路线，重点是尽早准备一套适合小队作战的装备。",
      "路线中标记了几个容易错过的职业任务，希望能帮助刚加入社区的朋友少走一些弯路。",
    ],
  },
  {
    id: "thread-raid-night",
    slug: "raid-night-recruitment",
    categorySlug: "community",
    categoryName: "公会与活动",
    title: "周五团队副本夜招募长期成员",
    excerpt: "每周五晚固定开团，招募治疗与远程输出，欢迎稳定在线的冒险者。",
    author: "Moon Council",
    authorRole: "公会会长",
    replies: 9,
    views: 802,
    lastActivity: "昨天",
    createdAt: "2026-09-01 20:40",
    tags: ["团队副本", "招募"],
    body: [
      "我们希望建立一个稳定、友好的周常团队。目前还需要治疗和远程输出职业，进度与装备要求会根据队伍情况调整。",
      "活动时间为每周五 20:30，报名时请留下角色名、职业和可在线时间。",
    ],
  },
  {
    id: "thread-stormspire-login",
    slug: "stormspire-login-issue",
    categorySlug: "support",
    categoryName: "问题反馈",
    title: "Stormspire 维护期间无法登录",
    excerpt: "维护期间 Realm 暂停登录属于预期状态，更新完成后会在这里同步结果。",
    author: "Azeroth Team",
    authorRole: "官方团队",
    replies: 4,
    views: 510,
    lastActivity: "昨天",
    createdAt: "2026-08-30 09:10",
    isPinned: true,
    tags: ["维护", "Stormspire"],
    body: [
      "Stormspire 当前正在进行版本更新与数据库维护，维护期间无法登录属于预期状态。",
      "我们会在维护完成后更新 Realm 状态。如果维护结束后仍然无法登录，请在本主题下回复客户端版本与错误提示。",
    ],
  },
]

const shopProducts: ShopProduct[] = [
  {
    id: "shop-vip",
    slug: "realm-vip",
    name: "Realm 会员 · 30 天",
    category: "账号服务",
    description: "为你的主账号解锁专属标识、队列优先与社区徽章。",
    details: ["30 天会员时长", "社区个人页专属徽章", "演示阶段仅记录购买状态"],
    price: 680,
    currency: "点券",
    accent: "gold",
    featured: true,
  },
  {
    id: "shop-mount",
    slug: "moon-raptor",
    name: "月影迅猛龙",
    category: "坐骑伙伴",
    description: "一只适合夜行远征的稀有坐骑，为你的旅程增添一抹月色。",
    details: ["坐骑收藏外观", "适用于巫妖王之怒 Realm", "演示阶段不发放游戏内物品"],
    price: 1280,
    currency: "点券",
    accent: "purple",
  },
  {
    id: "shop-tabard",
    slug: "azeroth-tabard",
    name: "Azeroth 社区战袍",
    category: "外观收藏",
    description: "以社区徽记为灵感设计的限定战袍，记录你与伙伴的共同旅程。",
    details: ["社区限定外观", "角色展示页专属标记", "演示阶段不发放游戏内物品"],
    price: 420,
    currency: "点券",
    accent: "blue",
  },
  {
    id: "shop-name-change",
    slug: "name-change",
    name: "角色改名服务",
    category: "账号服务",
    description: "为一个角色预留一次名称修改机会，正式接入时由角色服务处理。",
    details: ["一次角色改名额度", "购买后进入服务队列", "演示阶段只记录订单"],
    price: 980,
    currency: "点券",
    accent: "green",
  },
]

const adminOverview: AdminOverview = {
  totalPlayers: 2846,
  onlinePlayers: 2299,
  totalCharacters: 6384,
  pendingReports: 7,
  revenueThisMonth: "128,640 点券",
}

const adminUsers: AdminUserSummary[] = [
  {
    id: "user-admin",
    username: "Admin",
    email: "admin@admin.com",
    role: "管理员",
    status: "正常",
    characters: 3,
    lastActive: "刚刚",
  },
  {
    id: "user-arya",
    username: "Arya",
    email: "arya@example.com",
    role: "玩家",
    status: "正常",
    characters: 2,
    lastActive: "8 分钟前",
  },
  {
    id: "user-kael",
    username: "Kaelthas",
    email: "kael@example.com",
    role: "玩家",
    status: "待验证",
    characters: 1,
    lastActive: "1 小时前",
  },
  {
    id: "user-thorne",
    username: "Thorne",
    email: "thorne@example.com",
    role: "玩家",
    status: "已暂停",
    characters: 1,
    lastActive: "昨天",
  },
]

export const mockPortalDataProvider: PortalDataProvider = {
  async getRealms() {
    return realms
  },
  async getNews() {
    return news
  },
  async getAdminNews() {
    return news
  },
  async getNewsArticle(slug) {
    return news.find((article) => article.slug === slug)
  },
  async getCharacters() {
    return characters
  },
  async getCharacter(id) {
    return characters.find((character) => character.id === id)
  },
  async getPlayerProfile() {
    return playerProfile
  },
  async getForumCategories() {
    return forumCategories
  },
  async getForumThreads() {
    return forumThreads
  },
  async getForumThread(slug) {
    return forumThreads.find((thread) => thread.slug === slug)
  },
  async getShopProducts() {
    return shopProducts
  },
  async getShopProduct(slug) {
    return shopProducts.find((product) => product.slug === slug)
  },
  async getAdminOverview() {
    return adminOverview
  },
  async getAdminUsers() {
    return adminUsers
  },
}

export {
  adminUsers,
  characters,
  forumCategories,
  forumThreads,
  news,
  playerProfile,
  realms,
  shopProducts,
}
