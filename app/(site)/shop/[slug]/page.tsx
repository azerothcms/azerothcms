import Link from "next/link"
import { ArrowLeft, Check, Coins, ShieldCheck, Sparkles } from "lucide-react"
import { notFound } from "next/navigation"

import { ShopPurchaseAction } from "@/components/site/shop-purchase-action"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { portalDataProvider } from "@/lib/portal-data-provider"

type ShopProductPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await portalDataProvider.getShopProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: ShopProductPageProps) {
  const { slug } = await params
  const product = await portalDataProvider.getShopProduct(slug)

  return {
    title: product?.name ?? "商城商品",
    description: product?.description ?? "Azeroth CMS 社区商城商品。",
  }
}

export default async function ShopProductPage({ params }: ShopProductPageProps) {
  const { slug } = await params
  const product = await portalDataProvider.getShopProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="content-shell page-section">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回商城
      </Link>
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className={`relative min-h-80 overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/20 via-slate-950 to-slate-950 p-8`}>
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="relative flex h-full min-h-64 flex-col justify-between">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary"><Sparkles className="size-5" aria-hidden="true" /></span>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{product.category}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{product.name}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="eyebrow">Community store item</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{product.name}</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">{product.description}</p>
          <div className="mt-7 flex items-end gap-3">
            <Coins className="mb-1 size-5 text-primary" aria-hidden="true" />
            <span className="font-mono text-3xl font-semibold text-foreground">{product.price.toLocaleString()}</span>
            <span className="mb-1 text-sm text-muted-foreground">{product.currency}</span>
          </div>
          <div className="mt-8"><ShopPurchaseAction product={product} /></div>
          <Card className="glass-surface mt-8">
            <CardHeader>
              <CardTitle>商品说明</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm text-muted-foreground">
                {product.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />订单会写入 CMS；支付、库存和游戏内发放将在后续接入真实服务。</p>
        </div>
      </div>
    </div>
  )
}
