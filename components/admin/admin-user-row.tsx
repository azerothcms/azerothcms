"use client"

import { Mail, UserRound } from "lucide-react"
import { useState } from "react"

import {
  AdminUserActions,
  AdminUserStatus,
} from "@/components/admin/admin-user-actions"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import type { AdminUserSummary } from "@/lib/types"

export function AdminUserRow({ user }: { user: AdminUserSummary }) {
  const [status, setStatus] = useState(user.status)

  return (
    <TableRow>
      <TableCell className="min-w-56 whitespace-normal pl-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
            <UserRound className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.username}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {user.role} · 最近活跃 {user.lastActive}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="size-3.5 shrink-0" aria-hidden="true" />
          {user.email}
        </span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{user.characters} 个角色</TableCell>
      <TableCell>
        <AdminUserStatus status={status} />
      </TableCell>
      <TableCell className="pr-6 text-right">
        <AdminUserActions
          user={user}
          status={status}
          onStatusChange={setStatus}
        />
      </TableCell>
    </TableRow>
  )
}
