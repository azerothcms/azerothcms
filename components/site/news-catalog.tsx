"use client"

import { useMemo, useState } from "react"
import { Newspaper } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NewsCard } from "@/components/site/news-card"
import type { NewsArticle } from "@/lib/types"

const categories = ["全部动态", "公告", "活动", "社区"] as const
type NewsCategory = (typeof categories)[number]

export function NewsCatalog({ articles }: { articles: NewsArticle[] }) {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>("全部动态")
  const visibleArticles = useMemo(
    () => activeCategory === "全部动态" ? articles : articles.filter((article) => article.category === activeCategory),
    [activeCategory, articles]
  )

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
        <ToggleGroup
          value={[activeCategory]}
          onValueChange={(value) => {
            const nextCategory = value[0] as NewsCategory | undefined

            if (nextCategory) {
              setActiveCategory(nextCategory)
            }
          }}
          className="glass-segmented flex-wrap"
          spacing={1}
          aria-label="新闻分类"
        >
          {categories.map((category) => (
            <ToggleGroupItem
              key={category}
              value={category}
              className="filter-chip data-[state=on]:border-primary/20 data-[state=on]:bg-[color:var(--selection)] data-[state=on]:text-primary"
            >
              {category}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">{visibleArticles.length} 条动态</p>
      </div>
      {visibleArticles.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
      ) : (
        <Empty className="mt-8 min-h-56 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>暂时没有新闻</EmptyTitle>
            <EmptyDescription>这个分类还没有发布动态，稍后再来看看吧。</EmptyDescription>
          </EmptyHeader>
          {activeCategory !== "全部动态" ? (
            <EmptyContent>
              <Button variant="outline" onClick={() => setActiveCategory("全部动态")}>查看全部动态</Button>
            </EmptyContent>
          ) : null}
        </Empty>
      )}
    </>
  )
}
