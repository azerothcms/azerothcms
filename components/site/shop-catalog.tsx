"use client"

import Link from "next/link"
import { ArrowUpRight, Check, PackageOpen, ShoppingBag, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { GlassNotice } from "@/components/ui/glass-notice"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { copy } from "@/lib/i18n"
import type { ShopProduct, ShopProductCategory } from "@/lib/types"
import { cn } from "@/lib/utils"

const categories: Array<"全部" | ShopProductCategory> = ["全部", "账号服务", "外观收藏", "坐骑伙伴"]

const accentStyles = {
  gold: "from-amber-300/20 via-primary/8 to-transparent text-primary",
  blue: "from-sky-300/20 via-sky-500/8 to-transparent text-sky-300",
  purple: "from-violet-300/20 via-violet-500/8 to-transparent text-violet-300",
  green: "from-emerald-300/20 via-emerald-500/8 to-transparent text-emerald-300",
}

export function ShopCatalog({ products }: { products: ShopProduct[] }) {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("全部")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [status, setStatus] = useState("")

  const visibleProducts = useMemo(
    () => activeCategory === "全部" ? products : products.filter((product) => product.category === activeCategory),
    [activeCategory, products]
  )
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const cartTotal = products.reduce((total, product) => total + (cart[product.id] ?? 0) * product.price, 0)

  function addToCart(product: ShopProduct) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }))
    setStatus(`${product.name} 已加入购物车。`)
  }

  function checkout() {
    if (!cartCount) {
      setStatus("购物车还是空的，先选择一件商品吧。")
      return
    }

    setStatus(copy.shop.checkoutSuccess)
    setCart({})
  }

  return (
    <>
      <div className="glass-surface flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <ToggleGroup
          value={[activeCategory]}
          onValueChange={(value) => {
            const nextCategory = value[0] as (typeof categories)[number] | undefined

            if (nextCategory) {
              setActiveCategory(nextCategory)
            }
          }}
          className="glass-segmented flex-wrap"
          spacing={1}
          aria-label="商城分类"
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
        <div className="flex items-center justify-between gap-4 text-sm sm:justify-end">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <ShoppingBag className="size-4 text-primary" aria-hidden="true" />
            {cartCount} 件 · {cartTotal.toLocaleString()} 点券
          </span>
          <Button size="sm" variant="outline" onClick={checkout}>
            {copy.shop.checkout}
          </Button>
        </div>
      </div>
      {status ? <GlassNotice className="mt-4" tone="info">{status}</GlassNotice> : null}
      {visibleProducts.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <Card key={product.id} className="glass-surface group overflow-hidden p-0 transition hover:border-primary/30">
              <CardHeader className={cn("relative min-h-44 rounded-none p-5", "bg-gradient-to-br", accentStyles[product.accent])}>
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/8">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                  {product.featured ? <Badge variant="secondary">推荐</Badge> : null}
                </div>
                <p className="relative mt-14 text-xs text-muted-foreground">{product.category}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-foreground">{product.name}</h2>
                  <Link href={`/shop/${product.slug}`} className="text-muted-foreground transition hover:text-primary" aria-label={`查看 ${product.name}`}>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{product.description}</p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div>
                    <p className="font-mono text-xl font-semibold text-foreground">{product.price.toLocaleString()}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{product.currency}</p>
                  </div>
                  <Button size="sm" onClick={() => addToCart(product)}>
                    <Check data-icon="inline-start" className="hidden group-active:inline" aria-hidden="true" />
                    {copy.shop.addToCart}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="mt-6 min-h-56 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>这个分类暂时没有商品</EmptyTitle>
            <EmptyDescription>换一个分类，或者稍后再来看看新的社区服务。</EmptyDescription>
          </EmptyHeader>
          {activeCategory !== "全部" ? (
            <EmptyContent>
              <Button variant="outline" onClick={() => setActiveCategory("全部")}>查看全部商品</Button>
            </EmptyContent>
          ) : null}
        </Empty>
      )}
    </>
  )
}
