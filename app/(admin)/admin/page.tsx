import Link from "next/link"
import { ArrowUpRight, CircleAlert, FileText, Server, Users } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SectionHeading } from "@/components/site/section-heading"
import { portalDataProvider } from "@/lib/portal-data-provider"

export const metadata = {
  title: "管理后台",
  description: "Azeroth CMS 社区运营与内容管理演示后台。",
}

export default async function AdminOverviewPage() {
  const [overview, articles, realms, users] = await Promise.all([
    portalDataProvider.getAdminOverview(),
    portalDataProvider.getNews(),
    portalDataProvider.getRealms(),
    portalDataProvider.getAdminUsers(),
  ])

  const stats = [
    { label: "注册玩家", value: overview.totalPlayers.toLocaleString(), detail: "+8.2% 本月", icon: Users },
    {
      label: "当前在线",
      value: overview.onlinePlayers.toLocaleString(),
      detail: `${realms.filter((realm) => realm.status === "online").length} 个 Realm 在线`,
      icon: Server,
    },
    { label: "待处理反馈", value: overview.pendingReports, detail: "需要管理员关注", icon: CircleAlert },
    { label: "本月点券流水", value: overview.revenueThisMonth, detail: "Mock 订单统计", icon: FileText },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading
        eyebrow="Admin dashboard"
        title="社区运营总览"
        description="从这里查看社区健康度、内容动态和 Realm 状态。"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.label} size="sm" className="glass-surface">
              <CardHeader>
                <Icon className="size-4 text-primary" aria-hidden="true" />
                <CardTitle className="mt-4 text-xs text-muted-foreground">{stat.label}</CardTitle>
                <CardDescription>{stat.detail}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-semibold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>最近新闻</CardTitle>
            <CardDescription>最近发布的社区动态与服务公告。</CardDescription>
            <CardAction>
              <Link href="/admin/news" className="text-link">
                管理新闻
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {articles.slice(0, 4).map((article, index) => (
                <div key={article.id}>
                  {index > 0 ? <Separator /> : null}
                  <Link
                    href={`/news/${article.slug}`}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground hover:text-primary">
                        {article.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {article.category} · {article.publishedAt}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">已发布</span>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>玩家概况</CardTitle>
            <CardDescription>最近活跃的玩家账号。</CardDescription>
            <CardAction>
              <Link href="/admin/users" className="text-link">
                查看玩家
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {users.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                      {user.username.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{user.username}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{user.lastActive}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/admin/news", label: "发布社区新闻", description: "创建内容草稿" },
          { href: "/admin/realms", label: "检查 Realm 状态", description: "查看在线与维护" },
          { href: "/admin/users", label: "处理玩家账号", description: "查看玩家状态" },
        ].map((item) => (
          <Card key={item.href} className="glass-surface transition hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle>{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={item.href} className="flex items-center gap-2 text-sm text-primary">
                打开管理
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
