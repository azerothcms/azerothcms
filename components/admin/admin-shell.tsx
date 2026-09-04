"use client"

import Link from "next/link"
import { LayoutDashboard, LogOut, Newspaper, Server, Users } from "lucide-react"
import { useEffect, useSyncExternalStore, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ConsoleSidebar } from "@/components/console/console-sidebar"
import { ConsoleMobileNav } from "@/components/console/console-mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SkipToContent } from "@/components/skip-to-content"
import { copy } from "@/lib/i18n"
import type { SessionState } from "@/lib/types"
import {
  clearDemoSession,
  getDemoSession,
  getDemoSessionSnapshot,
  getHydrationSnapshot,
  getServerDemoSessionSnapshot,
  getServerHydrationSnapshot,
  subscribeDemoSession,
  subscribeHydration,
} from "@/lib/session"

const adminLinks = [
  { href: "/admin", label: copy.admin.overview, icon: LayoutDashboard },
  { href: "/admin/news", label: copy.admin.news, icon: Newspaper },
  { href: "/admin/realms", label: copy.admin.realms, icon: Server },
  { href: "/admin/users", label: copy.admin.users, icon: Users },
]

export function AdminShell({
  children,
  initialSession,
}: {
  children: ReactNode
  initialSession?: SessionState
}) {
  const pathname = usePathname()
  const router = useRouter()
  const authenticated = useSyncExternalStore(
    subscribeDemoSession,
    getDemoSessionSnapshot,
    getServerDemoSessionSnapshot
  )
  const hydrated = useSyncExternalStore(subscribeHydration, getHydrationSnapshot, getServerHydrationSnapshot)
  const clientSession = getDemoSession()
  const session = clientSession.authenticated ? clientSession : initialSession ?? clientSession
  const isAdmin = session.role === "admin"
  const hasSession = authenticated || Boolean(initialSession?.authenticated)
  const initialSessionAuthenticated = Boolean(initialSession?.authenticated)

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!authenticated && !initialSessionAuthenticated) {
      router.replace("/login")
      return
    }

    if (!isAdmin) {
      router.replace("/account")
    }
  }, [authenticated, hydrated, initialSessionAuthenticated, isAdmin, router])

  async function handleLogout() {
    clearDemoSession()
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (!hydrated || !hasSession || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-svh bg-background text-foreground lg:flex">
      <SkipToContent />
      <ConsoleSidebar
        links={adminLinks}
        pathname={pathname}
        session={session}
        subtitle="Admin console"
        sectionLabel="Administration"
        sectionDescription={copy.admin.subtitle}
        onLogout={handleLogout}
      />
      <div className="min-w-0 flex-1">
        <header className="glass-toolbar sticky top-0 z-30 border-b">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <ConsoleMobileNav links={adminLinks} pathname={pathname} label="移动端管理员后台导航" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{copy.admin.title}</p>
                <p className="mt-1 hidden truncate text-xs text-muted-foreground sm:block">{copy.admin.mockNotice}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/" className="hidden text-xs text-muted-foreground hover:text-foreground sm:block">返回站点</Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{copy.nav.logout}</span>
              </Button>
            </div>
          </div>
        </header>
        <main id="main-content" className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
