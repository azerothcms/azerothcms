import { CalendarDays, Mail, ReceiptText, ShoppingBag } from "lucide-react"

import { AdminOrderActions } from "@/components/admin/admin-order-actions"
import { SectionHeading } from "@/components/site/section-heading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { portalDataProvider } from "@/lib/portal-data-provider"

export const metadata = { title: "订单管理" }

export default async function AdminOrdersPage() {
  const orders = await portalDataProvider.getAdminShopOrders()

  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Order management" title="订单管理" description="查看商城订单，并推进支付与发放状态。" />
      {orders.length ? (
        <div className="mt-8 flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="glass-surface">
              <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ReceiptText className="size-4 text-primary" aria-hidden="true" />
                    订单 #{order.id}
                  </CardTitle>
                  <CardDescription className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1.5"><ShoppingBag className="size-3.5" aria-hidden="true" />{order.username}</span>
                    <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" aria-hidden="true" />{order.email || "未填写邮箱"}</span>
                  </CardDescription>
                </div>
                <AdminOrderActions order={order} />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 border-t border-border/70 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                  <span>{order.items}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs"><CalendarDays className="size-3.5" aria-hidden="true" />{order.createdAt}</span>
                </div>
                <span className="font-mono font-semibold text-foreground">{order.total.toLocaleString()} {order.currency}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="glass-surface mt-8 min-h-64 border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ShoppingBag aria-hidden="true" /></EmptyMedia>
            <EmptyTitle>还没有商城订单</EmptyTitle>
            <EmptyDescription>登录用户提交的订单会出现在这里。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
