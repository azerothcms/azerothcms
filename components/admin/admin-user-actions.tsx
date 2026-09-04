"use client"

import { Ban, CheckCircle2 } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getMockAdminServerSnapshot,
  getMockUserStatusesSnapshot,
  readMockUserStatuses,
  subscribeMockUserStatuses,
  writeMockUserStatus,
} from "@/lib/mock-admin-storage"
import type { AdminUserSummary } from "@/lib/types"

const statusVariants = {
  正常: "secondary",
  待验证: "outline",
  已暂停: "destructive",
} as const

function useMockUserStatus(user: AdminUserSummary) {
  const userStatusesSnapshot = useSyncExternalStore(
    subscribeMockUserStatuses,
    getMockUserStatusesSnapshot,
    getMockAdminServerSnapshot
  )

  return userStatusesSnapshot
    ? (readMockUserStatuses()[user.id] ?? user.status)
    : user.status
}

export function AdminUserStatus({ user }: { user: AdminUserSummary }) {
  const status = useMockUserStatus(user)

  return <Badge variant={statusVariants[status]}>{status}</Badge>
}

export function AdminUserActions({ user }: { user: AdminUserSummary }) {
  const status = useMockUserStatus(user)
  const suspended = status === "已暂停"
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function toggleStatus() {
    setPending(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked: !suspended }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setError(result.error ?? "保存玩家状态失败。")
        return
      }

      writeMockUserStatus(user.id, suspended ? "正常" : "已暂停")
    } catch {
      setError("无法连接管理服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
      <Button size="sm" variant="ghost" onClick={toggleStatus} disabled={pending}>
        {suspended ? (
          <CheckCircle2 data-icon="inline-start" aria-hidden="true" />
        ) : (
          <Ban data-icon="inline-start" aria-hidden="true" />
        )}
        {suspended ? "解除暂停" : "暂停账号"}
      </Button>
    </div>
  )
}
