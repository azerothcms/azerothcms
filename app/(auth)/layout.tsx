import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { getSetupStatus } from "@/lib/setup"

export const dynamic = "force-dynamic"

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const setup = await getSetupStatus()

  if (setup.setupRequired) {
    redirect("/setup")
  }

  return <AuthShell>{children}</AuthShell>
}
