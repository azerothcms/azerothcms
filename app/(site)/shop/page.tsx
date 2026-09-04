import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Coins, ShieldCheck, Sparkles } from "lucide-react"

import { SectionHeading } from "@/components/site/section-heading"
import { ShopCatalog } from "@/components/site/shop-catalog"
import { copy } from "@/lib/i18n"
import { mockPortalDataProvider } from "@/lib/mock-data"

export const metadata = {
  title: copy.shop.title,
  description: copy.shop.description,
}

export default async function ShopPage() {
  const products = await mockPortalDataProvider.getShopProducts()

  return (
    <div className="content-shell page-section">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回首页
      </Link>
      <div className="mt-8 grid gap-8 rounded-[2rem] border border-primary/20 bg-slate-950 p-7 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:p-14">
        <div>
          <p className="eyebrow">Community store</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{copy.shop.title}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">{copy.shop.description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: "透明价格", icon: Coins },
            { label: "安全兑换", icon: ShieldCheck },
            { label: "社区精选", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon
            return <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"><Icon className="size-4 text-primary" aria-hidden="true" />{item.label}</div>
          })}
        </div>
      </div>
      <div className="mt-10 flex items-end justify-between gap-4">
        <SectionHeading eyebrow="Featured catalog" title="为你的旅程添一件收藏" description="所有商品均为本地演示数据，后续可接入商城与订单服务。" />
        <Link href="/account" className="hidden text-link sm:inline-flex">查看我的账号<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
      </div>
      <div className="mt-8"><ShopCatalog products={products} /></div>
    </div>
  )
}
