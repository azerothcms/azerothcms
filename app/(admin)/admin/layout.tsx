import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession()
  return <AdminShell initialSession={session}>{children}</AdminShell>
}
