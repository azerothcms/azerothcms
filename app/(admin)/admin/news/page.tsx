import { CalendarDays, FileText } from "lucide-react"

import { AdminNewsActions } from "@/components/admin/admin-news-actions"
import { SectionHeading } from "@/components/site/section-heading"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { portalDataProvider } from "@/lib/portal-data-provider"

export const metadata = { title: "新闻管理" }

export default async function AdminNewsPage() {
  const articles = await portalDataProvider.getAdminNews()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionHeading eyebrow="Content management" title="新闻管理" description="维护首页动态与社区公告的发布状态。" /><AdminNewsActions /></div>
      <Card className="glass-surface mt-8">
        <CardHeader className="md:hidden">
          <CardTitle>新闻列表</CardTitle>
          <CardDescription>已发布的社区动态与服务公告。</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden grid-cols-[1fr_120px_130px_100px] gap-4 border-b border-border/70 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:grid">
            <span>标题</span><span>分类</span><span>发布时间</span><span>状态</span>
          </div>
          <div className="flex flex-col">
            {articles.map((article, index) => (
              <div key={article.id}>
                {index > 0 ? <Separator /> : null}
                <div className="grid gap-3 px-6 py-5 md:grid-cols-[1fr_120px_130px_100px] md:items-center md:gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{article.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{article.excerpt}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{article.category}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {article.publishedAt}
                  </span>
                  <Badge variant={article.status === "draft" ? "warning" : "secondary"}>
                    {article.status === "draft" ? "草稿" : "已发布"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">新闻草稿会写入 CMS 的 `news_article` 表；定时发布、权限审核与正式新闻发布流程仍需后续接入。</p>
    </div>
  )
}
