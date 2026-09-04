"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LogOut, Settings, Shield, ShoppingBag, Swords } from "lucide-react"
import { useEffect, useSyncExternalStore, type ReactNode } from "react"

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

const accountLinks = [
  { href: "/account", label: copy.account.overview, icon: LayoutDashboard },
  { href: "/account/game-accounts", label: copy.account.gameAccounts, icon: Shield },
  { href: "/account/characters", label: copy.account.characters, icon: Swords },
  { href: "/account/orders", label: "订单记录", icon: ShoppingBag },
  { href: "/account/settings", label: copy.account.settings, icon: Settings },
]

export function AccountShell({
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
  const hasSession = authenticated || Boolean(initialSession?.authenticated)
  const initialSessionAuthenticated = Boolean(initialSession?.authenticated)

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!authenticated && !initialSessionAuthenticated) {
      router.replace("/login")
    }
  }, [authenticated, hydrated, initialSessionAuthenticated, router])

  async function handleLogout() {
    clearDemoSession()
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (!hydrated || !hasSession || !session.authenticated) {
    return null
  }

  return (
    <div className="min-h-svh bg-background text-foreground lg:flex">
      <SkipToContent />
      <ConsoleSidebar
        links={accountLinks}
        pathname={pathname}
        session={session}
        subtitle="Player center"
        sectionLabel="玩家中心"
        sectionDescription="管理你的艾泽拉斯旅程"
        onLogout={handleLogout}
      />
      <div className="min-w-0 flex-1">
        <header className="glass-toolbar sticky top-0 z-30 border-b">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <ConsoleMobileNav links={accountLinks} pathname={pathname} label="移动端玩家中心导航" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{copy.account.title}</p>
                <p className="mt-1 hidden truncate text-xs text-muted-foreground sm:block">
                  欢迎回来，{session.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/realms" className="hidden text-xs text-muted-foreground hover:text-foreground sm:block">
                服务器状态
              </Link>
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
