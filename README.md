# AzerothCMS

中文优先的魔兽世界私服官网与玩家中心 UI 原型。项目采用 Next.js App Router、React、TypeScript、Tailwind CSS 和 shadcn/ui，视觉方向为 SwiftUI/macOS 风格的 Liquid Glass 界面。

当前项目已接入 MySQL 后端：网站认证注册会写入 TrinityCore 的 `auth.account`，门户自有数据使用独立的 `cms` 数据库及 `cms` 内容表。新闻、论坛、商城等页面数据仍保留 Mock fallback，待内容迁移和管理接口补齐后切换为完整持久化。

## 快速开始

```bash
pnpm install
pnpm dev
```

复制 `.env.example` 为 `.env.local` 并填写 MySQL 连接信息，然后执行 `sql/cms.sql` 初始化门户数据库。TrinityCore 的连接默认对应本机 `auth`、`world`、`characters` 数据库；注册使用 TrinityCore Grunt SRP6 格式生成 `salt` 与 `verifier`。

首次启动访问 [http://localhost:3000/setup](http://localhost:3000/setup) 进入初始化向导。向导会检查 TrinityCore auth 库和 CMS 库，并在 auth 库尚无管理员时创建首个管理员账号；管理员创建成功后会自动登录后台。CMS SQL 需要使用具备 `CREATE`/`GRANT` 权限的数据库账号执行，应用账号仅需要业务表读写权限。

打开 [http://localhost:3000](http://localhost:3000)。

常用检查命令：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 账号与权限

注册账号直接写入 TrinityCore `auth.account`，密码长度限制为 8-16 个字符以兼容核心。登录使用邮箱或游戏账号；拥有 `auth.account_access.SecurityLevel >= 3` 的账号会获得网站管理员角色。网站会话使用 HttpOnly 签名 Cookie，客户端只保存用于界面同步的非敏感快照。

## 页面范围

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 官网 | `/` | 首页、Realm 摘要、新闻摘要、Armory 入口 |
| 新闻 | `/news`、`/news/[slug]` | 分类筛选、新闻详情、分享演示 |
| Realm | `/realms` | 在线、离线、维护状态与在线人数 |
| Armory | `/armory`、`/armory/character/[id]` | 角色搜索、角色详情、装备信息 |
| 论坛 | `/forums`、`/forums/[slug]` | 分类、主题详情、发布主题、回复演示 |
| 商城 | `/shop`、`/shop/[slug]` | 分类筛选、购物车、结算演示 |
| 认证 | `/login`、`/register` | TrinityCore 账号登录、注册与会话 |
| 初始化 | `/setup` | 数据库检查、首个管理员创建与 CMS 初始化指引 |
| 玩家中心 | `/account/*` | 游戏账号、角色、账号设置 |
| 管理后台 | `/admin/*` | 新闻、Realm、玩家管理与状态操作演示 |

## 代码结构

- `app/(site)`：公开站点页面与布局。
- `app/(auth)`：认证页面与布局。
- `app/(account)`：需要登录的玩家中心。
- `app/(admin)`：需要管理员角色的后台页面。
- `components/site`：官网、论坛、商城和 Armory 组件。
- `components/account`、`components/admin`：玩家中心与后台交互组件。
- `components/ui`：shadcn/ui Base UI 组件及项目级视觉封装。
- `lib/types.ts`：领域类型和 `PortalDataProvider` 数据契约。
- `lib/mock-data.ts`：公开页面的 Mock fallback 数据。
- `lib/db.ts`：MySQL 连接池。
- `lib/auth.ts`、`lib/trinity-srp6.ts`：服务端会话、TrinityCore 账号注册与认证。
- `app/api/auth`：注册、登录、退出和会话接口。
- `app/api/cms/content`：管理员 CMS 内容读取与 JSON upsert 接口。
- `app/api/admin/news`：管理员新闻草稿写入 `news_article` 表。
- `app/api/forum`：登录用户发布论坛主题与回复，写入 `forum_thread`、`forum_reply` 表。
- `app/api/setup`、`lib/setup.ts`：首次启动状态检查与首个管理员初始化接口。
- `lib/session.ts`：客户端会话快照同步。
- `lib/i18n.ts`：中文优先文案字典。
- `app/globals.css`：SwiftUI/macOS 视觉令牌、Liquid Glass 材料和响应式基础样式。

后续接入 AzerothCore、TrinityCore 或独立 API 时，应优先替换 `PortalDataProvider` 实现，不直接改写页面组件的数据边界。

## UI 约定

- 使用 Apple 系统字体栈、浅色/深色主题和 Liquid Glass 材料层级。
- 使用 shadcn/ui 的 Card、Field、Input、Table、Badge、Alert、ToggleGroup 等基础组件进行组合。
- 页面支持桌面侧栏、移动端导航、键盘焦点恢复、Escape 关闭和减少动态效果偏好。
- 当前资源使用占位图形和可替换资源槽位，不直接打包未经确认授权的暴雪素材。

设计参考：[shadcn/ui Blocks](https://ui.shadcn.com/blocks)、[shadcn/ui](https://ui.shadcn.com) 以及本地 `Apple macOS 27 UI Kit.sketch`。

## 当前边界

商城内容目前仍支持 Mock fallback；新闻和论坛已支持读取/写入 CMS 业务表。真实支付、邮件验证、文件上传、权限审计、装备/公会详情同步和 CMS 发布服务留待后续阶段。
