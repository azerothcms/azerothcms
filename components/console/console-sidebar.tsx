"use client"

import Link from "next/link"
import { LogOut, PanelLeft, PanelLeftClose, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { copy } from "@/lib/i18n"
import type { SessionState } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ConsoleSidebarProps {
  links: Array<{ href: string; label: string; icon: LucideIcon }>
  pathname: string
  session: SessionState
  subtitle: string
  sectionDescription: string
  sectionLabel: string
  onLogout: () => void
}

export function ConsoleSidebar({
  links,
  pathname,
  session,
  subtitle,
  sectionDescription,
  sectionLabel,
  onLogout,
}: ConsoleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const initial = session.username?.slice(0, 1).toUpperCase() ?? "A"

  return (
    <aside
      className={cn(
        "glass-sidebar hidden shrink-0 border-r border-border/70 transition-[width,padding] duration-200 lg:flex lg:flex-col",
        collapsed ? "w-20 p-3" : "w-72 p-5"
      )}
      data-state={collapsed ? "collapsed" : "expanded"}
    >
      <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
        <Link
          href="/"
          className={cn("flex min-w-0 flex-1 items-center gap-3 px-3 py-2", collapsed && "justify-center")}
          aria-label={collapsed ? copy.brand : undefined}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Shield className="size-4" aria-hidden="true" />
          </span>
          <span className={cn("min-w-0", collapsed && "lg:hidden")}>
            <span className="block truncate text-sm font-semibold">{copy.brand}</span>
            <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {subtitle}
            </span>
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("shrink-0", collapsed && "absolute left-3 top-3")}
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "展开侧栏" : "折叠侧栏"}
          title={collapsed ? "展开侧栏" : "折叠侧栏"}
        >
          {collapsed ? <PanelLeft data-icon="inline-start" aria-hidden="true" /> : <PanelLeftClose data-icon="inline-start" aria-hidden="true" />}
        </Button>
      </div>

      <div className={cn("mt-10 px-3", collapsed && "lg:hidden")}>
        <p className="eyebrow">{sectionLabel}</p>
        <p className="mt-2 text-sm text-muted-foreground">{sectionDescription}</p>
      </div>

      <nav className="mt-6 grid gap-1" aria-label={`${sectionLabel}导航`}>
        {links.map((item) => {
          const Icon = item.icon
          const active = item.href === links[0]?.href ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                active ? "bg-primary/12 font-medium text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <Card size="sm" className={cn("glass-surface mt-auto", collapsed && "p-0")}>
        <CardContent className={cn("flex flex-col gap-4 p-4", collapsed && "items-center p-2")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {initial}
            </span>
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-medium">{session.username}</p>
              <p className="truncate text-xs text-muted-foreground">{session.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className={cn("w-full justify-start gap-2", collapsed && "size-8 justify-center p-0")}
            onClick={onLogout}
            aria-label={collapsed ? copy.nav.logout : undefined}
            title={collapsed ? copy.nav.logout : undefined}
          >
            <LogOut data-icon="inline-start" aria-hidden="true" />
            <span className={cn(collapsed && "lg:hidden")}>{copy.nav.logout}</span>
          </Button>
        </CardContent>
      </Card>
    </aside>
  )
}
