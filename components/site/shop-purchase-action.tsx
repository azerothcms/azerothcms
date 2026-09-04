"use client"

import { Check, ShoppingBag } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { GlassNotice } from "@/components/ui/glass-notice"
import { copy } from "@/lib/i18n"
import type { ShopProduct } from "@/lib/types"

export function ShopPurchaseAction({ product }: { product: ShopProduct }) {
  const [purchased, setPurchased] = useState(false)

  return (
    <div>
      <Button size="lg" onClick={() => setPurchased(true)}>
        {purchased ? <Check className="size-4" aria-hidden="true" /> : <ShoppingBag className="size-4" aria-hidden="true" />}
        {purchased ? `${product.name} 已加入演示订单` : copy.shop.addToCart}
      </Button>
      {purchased ? <GlassNotice className="mt-3" tone="success">{copy.shop.checkoutSuccess}</GlassNotice> : null}
    </div>
  )
}
