import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react"
import { notFound } from "next/navigation"

import { ArticleShareButton } from "@/components/site/article-share-button"
import { copy } from "@/lib/i18n"
import { news } from "@/lib/mock-data"
import { portalDataProvider } from "@/lib/portal-data-provider"

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return news.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await portalDataProvider.getNewsArticle(slug)

  return {
    title: article?.title ?? "社区动态",
    description: article?.excerpt,
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params
  const article = await portalDataProvider.getNewsArticle(slug)

  if (!article) {
    notFound()
  }

  return (
    <article className="content-shell page-section">
      <Link href="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回动态列表
      </Link>
      <div className="mx-auto mt-10 max-w-3xl">
        <span className="filter-chip-active">{article.category}</span>
        <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">{article.title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{article.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-5 border-y border-border/70 py-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" aria-hidden="true" />{article.publishedAt}</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="size-4" aria-hidden="true" />{article.readTime}</span>
          <ArticleShareButton title={article.title} />
        </div>
        <div className="article-cover mt-10 rounded-[2rem] border border-primary/20 p-8 sm:p-12">
          <div className="max-w-md">
            <p className="eyebrow">Azeroth community journal</p>
            <p className="mt-5 text-3xl font-semibold leading-tight text-white">记录每一次出发，
              <br />也记录每一次归来。</p>
          </div>
        </div>
        <div className="prose-portal mt-10">
          {article.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-border/70 pt-6">
          <Link href="/news" className="text-link"><ArrowLeft className="size-4" aria-hidden="true" />返回全部动态</Link>
          <Link href="/account" className="text-link">{copy.nav.account}<span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  )
}
