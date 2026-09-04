import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Flame, MessageCircle, Pin, Users } from "lucide-react"

import { ForumComposer } from "@/components/site/forum-composer"
import { SectionHeading } from "@/components/site/section-heading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { copy } from "@/lib/i18n"
import { portalDataProvider } from "@/lib/portal-data-provider"

export const metadata = {
  title: copy.forum.title,
  description: copy.forum.description,
}

const categoryStyles = {
  gold: "border-primary/25 bg-primary/8 text-primary",
  blue: "border-sky-400/20 bg-sky-400/8 text-sky-300",
  purple: "border-violet-400/20 bg-violet-400/8 text-violet-300",
  green: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
}

export default async function ForumsPage() {
  const [categories, threads] = await Promise.all([
    portalDataProvider.getForumCategories(),
    portalDataProvider.getForumThreads(),
  ])
  const totalThreads = categories.reduce((total, category) => total + category.threadCount, 0)

  return (
    <div className="content-shell page-section">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回首页
      </Link>
      <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="Community forum"
          title={copy.forum.title}
          description={copy.forum.description}
        />
        <ForumComposer />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { label: "社区成员", value: "12,480", icon: Users },
          { label: "讨论主题", value: totalThreads.toLocaleString(), icon: MessageCircle },
          { label: "今日活跃", value: "386", icon: Flame },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} size="sm" className="glass-surface">
              <CardHeader>
                <Icon className="size-4 text-primary" aria-hidden="true" />
                <CardTitle className="mt-4 text-xs text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-semibold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse categories</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">找到你的讨论区</h2>
          </div>
          <span className="text-xs text-muted-foreground">数据来自本地演示目录</span>
        </div>
        {categories.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <Link key={category.id} href={`/forums#${category.slug}`} id={category.slug} className="group block">
                <Card className="glass-surface transition group-hover:-translate-y-0.5 group-hover:border-primary/30">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex size-10 items-center justify-center rounded-xl border ${categoryStyles[category.accent]}`}>
                        <MessageCircle className="size-4" aria-hidden="true" />
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-1 text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{category.threadCount} 个主题</span>
                      <span className="truncate">最新：{category.latestThread}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Empty className="mt-5 min-h-48 border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><MessageCircle aria-hidden="true" /></EmptyMedia>
              <EmptyTitle>暂时没有讨论区</EmptyTitle>
              <EmptyDescription>论坛分类正在准备中，请稍后再来。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Latest discussions</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">最新讨论</h2>
          </div>
          <span className="text-xs text-muted-foreground">按最近活动排序</span>
        </div>
        <Card className="glass-surface mt-5 overflow-hidden">
          <div className="hidden grid-cols-[1fr_100px_100px_130px] gap-4 border-b border-border/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:grid">
            <span>主题</span>
            <span>回复</span>
            <span>浏览</span>
            <span>最近活动</span>
          </div>
          <CardContent className="p-0">
            {threads.length ? (
              <div className="flex flex-col">
                {threads.map((thread, index) => (
                  <div key={thread.id}>
                    {index > 0 ? <Separator /> : null}
                    <Link
                      href={`/forums/${thread.slug}`}
                      className="glass-list-row group grid gap-3 px-5 py-5 md:grid-cols-[1fr_100px_100px_130px] md:items-center md:gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          {thread.isPinned ? <Pin className="size-3 text-primary" aria-label="置顶" /> : null}
                          {thread.isHot ? <Flame className="size-3 text-orange-300" aria-label="热门" /> : null}
                          <span className="text-primary">{thread.categoryName}</span>
                          {thread.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                        </div>
                        <h3 className="mt-2 truncate font-medium text-foreground group-hover:text-primary">{thread.title}</h3>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{thread.excerpt}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{thread.author} · {thread.authorRole}</p>
                      </div>
                      <div className="text-xs text-muted-foreground md:text-sm">{thread.replies} 回复</div>
                      <div className="text-xs text-muted-foreground md:text-sm">{thread.views.toLocaleString()} 浏览</div>
                      <div className="text-xs text-muted-foreground">{thread.lastActivity}</div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <Empty className="min-h-48 rounded-none border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><MessageCircle aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle>还没有主题</EmptyTitle>
                  <EmptyDescription>成为第一个分享冒险故事的人吧。</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/6 p-5 text-sm leading-6 text-muted-foreground">
        <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>论坛发帖和回复会保存在当前浏览器，用于验证 Mock 交互闭环；真实审核与通知将在接入用户系统后开放。</p>
      </div>
    </div>
  )
}
