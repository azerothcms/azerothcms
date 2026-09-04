import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, CalendarDays, ReceiptText, ShoppingBag } from "lucide-react"

import { requireSession } from "@/lib/auth"
import { portalDataProvider } from "@/lib/portal-data-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export const metadata = {
  title: "订单记录",
}

const statusLabels = {
  pending: "待处理",
  paid: "已支付",
  cancelled: "已取消",
  fulfilled: "已发放",
} as const

export default async function AccountOrdersPage() {
  const session = await requireSession()

  if (!session.accountId) {
    redirect("/login")
  }

  const orders = await portalDataProvider.getShopOrders(session.accountId)

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回总览
      </Link>
      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Order history</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">订单记录</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">查看你的商城订单与后续发放状态。</p>
        </div>
        <ShoppingBag className="hidden size-7 text-primary sm:block" aria-hidden="true" />
      </div>

      {orders.length ? (
        <div className="mt-8 flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="glass-surface">
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ReceiptText className="size-4 text-primary" aria-hidden="true" />
                    订单 #{order.id}
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {order.createdAt}
                  </CardDescription>
                </div>
                <Badge variant={order.status === "cancelled" ? "destructive" : order.status === "fulfilled" ? "secondary" : "warning"}>
                  {statusLabels[order.status]}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 border-t border-border/70 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">{order.items}</span>
                <span className="font-mono font-semibold text-foreground">{order.total.toLocaleString()} {order.currency}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="glass-surface mt-8 min-h-64 border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ShoppingBag aria-hidden="true" /></EmptyMedia>
            <EmptyTitle>还没有订单</EmptyTitle>
            <EmptyDescription>去商城挑选一件收藏，订单会显示在这里。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
