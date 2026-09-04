"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConsoleMobileNavProps {
  links: Array<{ href: string; label: string; icon: LucideIcon }>
  pathname: string
  label: string
}

export function ConsoleMobileNav({ links, pathname, label }: ConsoleMobileNavProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>("a")
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"
    requestAnimationFrame(() => firstLink?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        requestAnimationFrame(() => triggerRef.current?.focus())
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (
        target instanceof Node &&
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false)
        requestAnimationFrame(() => triggerRef.current?.focus())
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("pointerdown", handlePointerDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [open])

  function close() {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div className="relative lg:hidden">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-sm"
        aria-label={open ? "关闭导航" : "打开导航"}
        aria-controls="console-mobile-navigation"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X data-icon="inline-start" aria-hidden="true" /> : <Menu data-icon="inline-start" aria-hidden="true" />}
      </Button>

      {open ? (
        <div
          ref={panelRef}
          id="console-mobile-navigation"
          className="glass-popover absolute left-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border p-2 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
        >
          <nav aria-label={label} className="flex flex-col gap-1">
            {links.map((item) => {
              const Icon = item.icon
              const active = item.href === links[0]?.href ? pathname === item.href : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                    active ? "bg-primary/12 font-medium text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                  onClick={close}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ) : null}
    </div>
  )
}
