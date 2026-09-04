"use client"

import { Check, CircleX, PackageCheck, RotateCcw } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AdminShopOrderSummary } from "@/lib/types"

const statusLabels = {
  pending: "待处理",
  paid: "已支付",
  cancelled: "已取消",
  fulfilled: "已发放",
} as const

const statusVariants = {
  pending: "warning",
  paid: "secondary",
  cancelled: "destructive",
  fulfilled: "secondary",
} as const

function nextStatus(status: AdminShopOrderSummary["status"]) {
  if (status === "pending") return "paid"
  if (status === "paid") return "fulfilled"
  if (status === "cancelled") return "pending"
  return null
}

function nextStatusLabel(status: AdminShopOrderSummary["status"]) {
  if (status === "pending") return "标记已支付"
  if (status === "paid") return "标记已发放"
  if (status === "cancelled") return "恢复待处理"
  return "已完成"
}

export function AdminOrderActions({ order }: { order: AdminShopOrderSummary }) {
  const [status, setStatus] = useState(order.status)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const next = nextStatus(status)

  async function updateStatus(nextOrderStatus: NonNullable<ReturnType<typeof nextStatus>>) {
    setPending(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextOrderStatus }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error ?? "更新订单失败。")
        return
      }

      setStatus(nextOrderStatus)
    } catch {
      setError("无法连接管理服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  const actionIcon = status === "pending" ? Check : status === "paid" ? PackageCheck : status === "cancelled" ? RotateCcw : CircleX

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
      <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
      {next ? (
        <Button size="sm" variant="ghost" onClick={() => void updateStatus(next)} disabled={pending}>
          {(() => {
            const Icon = actionIcon
            return <Icon data-icon="inline-start" aria-hidden="true" />
          })()}
          {pending ? "保存中" : nextStatusLabel(status)}
        </Button>
      ) : null}
    </div>
  )
}
