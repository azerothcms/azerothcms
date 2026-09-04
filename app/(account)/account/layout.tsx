import type { ReactNode } from "react"

import { AccountShell } from "@/components/account/account-shell"
import { requireSession } from "@/lib/auth"

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await requireSession()
  return <AccountShell initialSession={session}>{children}</AccountShell>
}
