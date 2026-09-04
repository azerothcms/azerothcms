"use client"

import { Check, ShoppingBag } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { GlassNotice } from "@/components/ui/glass-notice"
import { copy } from "@/lib/i18n"
import {
  getMockShopOrderSnapshot,
  getMockShopServerSnapshot,
  readMockShopOrder,
  subscribeMockShopOrder,
  writeMockShopOrder,
} from "@/lib/mock-shop-storage"
import type { ShopProduct } from "@/lib/types"

export function ShopPurchaseAction({ product }: { product: ShopProduct }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const orderSnapshot = useSyncExternalStore(
    subscribeMockShopOrder,
    getMockShopOrderSnapshot,
    getMockShopServerSnapshot
  )
  const purchased = orderSnapshot
    ? (readMockShopOrder()?.productIds.includes(product.id) ?? false)
    : false

  async function purchase() {
    setPending(true)
    setError("")

    try {
      const response = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ productId: product.id, quantity: 1 }] }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error ?? "提交订单失败，请稍后重试。")
        return
      }

      writeMockShopOrder({ productIds: [product.id], total: product.price })
    } catch {
      setError("无法连接商城服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <Button size="lg" onClick={() => void purchase()} disabled={pending || purchased}>
        {purchased ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <ShoppingBag className="size-4" aria-hidden="true" />
        )}
        {pending ? "提交中……" : purchased ? `${product.name} 已加入订单` : copy.shop.addToCart}
      </Button>
      {error ? (
        <GlassNotice className="mt-3" tone="error">
          {error}
        </GlassNotice>
      ) : null}
      {purchased ? (
        <GlassNotice className="mt-3" tone="success">
          {copy.shop.checkoutSuccess}
        </GlassNotice>
      ) : null}
    </div>
  )
}
