"use client"

import { Ban, CheckCircle2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { AdminUserSummary } from "@/lib/types"

export function AdminUserActions({ user }: { user: AdminUserSummary }) {
  const [status, setStatus] = useState(user.status)
  const suspended = status === "已暂停"

  return (
    <Button size="sm" variant="ghost" onClick={() => setStatus(suspended ? "正常" : "已暂停")}>
      {suspended ? <CheckCircle2 data-icon="inline-start" aria-hidden="true" /> : <Ban data-icon="inline-start" aria-hidden="true" />}
      {suspended ? "解除暂停" : "暂停账号"}
    </Button>
  )
}
