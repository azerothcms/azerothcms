import type { ReactNode } from "react"

import { SkipToContent } from "@/components/skip-to-content"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <SkipToContent />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  )
}
