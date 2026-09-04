"use client"

import { Check, ShoppingBag } from "lucide-react"
import { useSyncExternalStore } from "react"

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
  const orderSnapshot = useSyncExternalStore(
    subscribeMockShopOrder,
    getMockShopOrderSnapshot,
    getMockShopServerSnapshot
  )
  const purchased = orderSnapshot
    ? (readMockShopOrder()?.productIds.includes(product.id) ?? false)
    : false

  function purchase() {
    writeMockShopOrder({ productIds: [product.id], total: product.price })
  }

  return (
    <div>
      <Button size="lg" onClick={purchase}>
        {purchased ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <ShoppingBag className="size-4" aria-hidden="true" />
        )}
        {purchased ? `${product.name} 已加入演示订单` : copy.shop.addToCart}
      </Button>
      {purchased ? (
        <GlassNotice className="mt-3" tone="success">
          {copy.shop.checkoutSuccess}
        </GlassNotice>
      ) : null}
    </div>
  )
}
