"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Shield, X } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { copy } from "@/lib/i18n"
import {
  getDemoAdminSnapshot,
  getDemoSessionSnapshot,
  getServerDemoAdminSnapshot,
  getServerDemoSessionSnapshot,
  subscribeDemoSession,
} from "@/lib/session"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: copy.nav.home },
  { href: "/news", label: copy.nav.news },
  { href: "/realms", label: copy.nav.realms },
  { href: "/armory", label: copy.nav.armory },
  { href: "/forums", label: copy.nav.forums },
  { href: "/shop", label: copy.nav.shop },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)
  const authenticated = useSyncExternalStore(
    subscribeDemoSession,
    getDemoSessionSnapshot,
    getServerDemoSessionSnapshot
  )
  const isAdmin = useSyncExternalStore(
    subscribeDemoSession,
    getDemoAdminSnapshot,
    getServerDemoAdminSnapshot
  )

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"
    requestAnimationFrame(() => firstMobileLinkRef.current?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return
      }

      setMobileOpen(false)
      requestAnimationFrame(() => menuButtonRef.current?.focus())
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (
        target instanceof Node &&
        !mobileMenuRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setMobileOpen(false)
        requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("pointerdown", handlePointerDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [mobileOpen])

  return (
    <header className="glass-toolbar sticky top-0 z-40 border-b">
      <div className="content-shell flex h-18 items-center justify-between gap-5">
        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_rgba(214,167,84,0.12)] transition-transform group-hover:rotate-[-6deg]">
            <Shield className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-semibold tracking-wide text-foreground">
              {copy.brand}
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
              Community portal
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/6 hover:text-foreground",
                  active ? "bg-white/7 text-foreground" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {isAdmin ? (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-xs text-muted-foreground transition hover:bg-white/6 hover:text-foreground"
            >
              {copy.nav.admin}
            </Link>
          ) : null}
          <Link
            href={authenticated ? "/account" : "/login"}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {authenticated ? copy.nav.account : copy.nav.login}
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            ref={menuButtonRef}
            aria-label={mobileOpen ? "关闭导航菜单" : "打开导航菜单"}
            aria-controls="site-mobile-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div ref={mobileMenuRef} className="glass-popover absolute inset-x-0 top-full border-t lg:hidden">
          <div className="content-shell py-3">
            <nav id="site-mobile-navigation" className="grid gap-1" aria-label="移动端主导航">
              {navItems.map((item, index) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={index === 0 ? firstMobileLinkRef : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-3 text-sm hover:bg-white/6 hover:text-foreground",
                      active ? "bg-[color:var(--selection)] text-primary" : "text-muted-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-white/6 hover:text-foreground"
                >
                  {copy.nav.admin}
                </Link>
              ) : null}
              <Link
                href={authenticated ? "/account" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-lg bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                {authenticated ? copy.nav.account : copy.nav.login}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}
