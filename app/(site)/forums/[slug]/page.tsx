import Link from "next/link"
import { ArrowLeft, Eye, MessageCircle, Pin, UserRound } from "lucide-react"
import { notFound } from "next/navigation"

import { ForumThreadActions } from "@/components/site/forum-thread-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { portalDataProvider } from "@/lib/portal-data-provider"

type ForumThreadPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const threads = await portalDataProvider.getForumThreads()
  return threads.map((thread) => ({ slug: thread.slug }))
}

export async function generateMetadata({ params }: ForumThreadPageProps) {
  const { slug } = await params
  const thread = await portalDataProvider.getForumThread(slug)

  return {
    title: thread?.title ?? "论坛主题",
    description: thread?.excerpt ?? "Azeroth CMS 社区论坛主题。",
  }
}

export default async function ForumThreadPage({ params }: ForumThreadPageProps) {
  const { slug } = await params
  const thread = await portalDataProvider.getForumThread(slug)

  if (!thread) {
    notFound()
  }

  return (
    <div className="content-shell page-section">
      <Link href="/forums" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回论坛
      </Link>
      <div className="mt-8 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href={`/forums#${thread.categorySlug}`} className="text-primary hover:underline">{thread.categoryName}</Link>
          {thread.isPinned ? <Badge variant="secondary"><Pin className="size-3" aria-hidden="true" />置顶</Badge> : null}
          {thread.tags.map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{thread.title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span>发布于 {thread.createdAt}</span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" aria-hidden="true" />{thread.replies} 回复</span>
          <span className="inline-flex items-center gap-1.5"><Eye className="size-4" aria-hidden="true" />{thread.views.toLocaleString()} 浏览</span>
        </div>
      </div>

      <Card className="glass-surface mt-10 max-w-4xl overflow-hidden">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:p-8">
          <div className="flex shrink-0 items-center gap-3 sm:w-44 sm:flex-col sm:items-start">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium text-foreground">{thread.author}</p>
              <p className="mt-1 text-xs text-muted-foreground">{thread.authorRole}</p>
            </div>
          </div>
          <div className="prose-portal min-w-0 flex-1">
            {thread.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4 text-xs text-muted-foreground sm:px-8">
          {thread.repliesList ? "该主题与回复来自 CMS 论坛表。" : "这是一个本地 Mock 主题，真实版本将由论坛 API 提供帖子、回复与审核状态。"}
        </CardFooter>
      </Card>

      <ForumThreadActions threadSlug={thread.slug} initialReplies={thread.repliesList} />
    </div>
  )
}
