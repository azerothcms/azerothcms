"use client"

import { PauseCircle, PlayCircle } from "lucide-react"
import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/site/status-badge"
import { statusLabel } from "@/lib/i18n"
import {
  getMockAdminServerSnapshot,
  getMockRealmStatusesSnapshot,
  readMockRealmStatuses,
  subscribeMockRealmStatuses,
  writeMockRealmStatus,
} from "@/lib/mock-admin-storage"
import type { Realm, RealmStatus } from "@/lib/types"

export function AdminRealmActions({ realm }: { realm: Realm }) {
  const realmStatusesSnapshot = useSyncExternalStore(
    subscribeMockRealmStatuses,
    getMockRealmStatusesSnapshot,
    getMockAdminServerSnapshot
  )
  const status: RealmStatus = realmStatusesSnapshot
    ? (readMockRealmStatuses()[realm.id] ?? realm.status)
    : realm.status
  const nextStatus = status === "online" ? "maintenance" : "online"

  function toggleStatus() {
    writeMockRealmStatus(realm.id, nextStatus)
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        <span
          className={`text-xs ${
            status === "online"
              ? "text-emerald-300"
              : status === "offline"
                ? "text-muted-foreground"
                : "text-amber-300"
          }`}
        >
          当前状态：{statusLabel[status]}
        </span>
      </div>
      <Button size="sm" variant="outline" onClick={toggleStatus}>
        {nextStatus === "online" ? (
          <PlayCircle data-icon="inline-start" aria-hidden="true" />
        ) : (
          <PauseCircle data-icon="inline-start" aria-hidden="true" />
        )}
        {nextStatus === "online" ? "恢复在线" : "设为维护"}
      </Button>
    </div>
  )
}
