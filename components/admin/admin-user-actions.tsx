"use client"

import { Ban, CheckCircle2 } from "lucide-react"
import { useSyncExternalStore } from "react"

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

  function toggleStatus() {
    writeMockUserStatus(user.id, suspended ? "正常" : "已暂停")
  }

  return (
    <Button size="sm" variant="ghost" onClick={toggleStatus}>
      {suspended ? (
        <CheckCircle2 data-icon="inline-start" aria-hidden="true" />
      ) : (
        <Ban data-icon="inline-start" aria-hidden="true" />
      )}
      {suspended ? "解除暂停" : "暂停账号"}
    </Button>
  )
}
