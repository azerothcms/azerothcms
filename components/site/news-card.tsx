import Link from "next/link"
import { ArrowUpRight, CalendarDays } from "lucide-react"

import type { NewsArticle } from "@/lib/types"
import { cn } from "@/lib/utils"

const accentClasses = {
  gold: "from-amber-300/20 via-orange-400/5 to-transparent",
  blue: "from-sky-300/20 via-blue-500/5 to-transparent",
  purple: "from-violet-300/20 via-fuchsia-500/5 to-transparent",
}

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="glass-surface group relative flex min-h-65 flex-col justify-between overflow-hidden rounded-2xl border p-6 transition duration-300 hover:border-primary/35"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-br opacity-70",
          accentClasses[article.accent]
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-primary/25 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
            {article.category}
          </span>
          <ArrowUpRight
            className="size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
        <h3 className="mt-8 max-w-sm text-xl font-semibold leading-snug tracking-tight text-foreground">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {article.excerpt}
        </p>
      </div>
      <div className="relative mt-7 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {article.publishedAt}
        </span>
        <span>{article.readTime}</span>
      </div>
    </Link>
  )
}
