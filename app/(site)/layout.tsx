import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { PortalShell } from "@/components/site/portal-shell"
import { getSetupStatus } from "@/lib/setup"

export const dynamic = "force-dynamic"

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const setup = await getSetupStatus()

  if (setup.setupRequired) {
    redirect("/setup")
  }

  return <PortalShell>{children}</PortalShell>
}
