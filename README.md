# AzerothCMS

中文优先的魔兽世界私服官网与玩家中心 UI 原型。项目采用 Next.js App Router、React、TypeScript、Tailwind CSS 和 shadcn/ui，视觉方向为 SwiftUI/macOS 风格的 Liquid Glass 界面。

当前阶段只验证页面结构、交互闭环和数据边界，不连接真实数据库、模拟器核心、生产认证或后台服务。

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

常用检查命令：

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 演示账号

登录页使用固定 Mock 账号：

- 邮箱：`admin@admin.com`
- 密码：`admin@admin`

登录态仅保存在浏览器本地，用于访问玩家中心和管理员后台。退出登录会清除本地演示会话。

## 页面范围

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 官网 | `/` | 首页、Realm 摘要、新闻摘要、Armory 入口 |
| 新闻 | `/news`、`/news/[slug]` | 分类筛选、新闻详情、分享演示 |
| Realm | `/realms` | 在线、离线、维护状态与在线人数 |
| Armory | `/armory`、`/armory/character/[id]` | 角色搜索、角色详情、装备信息 |
| 论坛 | `/forums`、`/forums/[slug]` | 分类、主题详情、发布主题、回复演示 |
| 商城 | `/shop`、`/shop/[slug]` | 分类筛选、购物车、结算演示 |
| 认证 | `/login`、`/register` | 登录、注册字段校验与演示流程 |
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
- `lib/mock-data.ts`：首期 `MockPortalDataProvider` 实现。
- `lib/session.ts`：浏览器本地演示会话。
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

论坛、商城、管理员后台目前是可点击的 Mock UI；真实数据库、模拟器核心同步、支付、邮件验证、文件上传、权限审计和 CMS 发布服务留待后续阶段。
