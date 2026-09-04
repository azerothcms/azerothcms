import type { ReactNode } from "react"

import { PortalShell } from "@/components/site/portal-shell"

export const dynamic = "force-dynamic"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>
}
