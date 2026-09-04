import type { ReactNode } from "react"

import { PortalShell } from "@/components/site/portal-shell"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>
}
