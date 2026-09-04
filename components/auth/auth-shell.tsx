import Link from "next/link"
import { ArrowLeft, Shield, Sparkles } from "lucide-react"
import type { ReactNode } from "react"

import { SkipToContent } from "@/components/skip-to-content"
import { ThemeToggle } from "@/components/theme-toggle"
import { copy } from "@/lib/i18n"

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <SkipToContent />
      <aside className="relative hidden overflow-hidden border-r border-white/8 bg-slate-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="auth-orb auth-orb-one" />
          <div className="auth-orb auth-orb-two" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        </div>
        <Link href="/" className="relative flex items-center gap-3 text-white">
          <span className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Shield className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-wide">{copy.brand}</span>
        </Link>
        <div className="relative max-w-md">
          <Sparkles className="size-7 text-primary" aria-hidden="true" />
          <p className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white">
            每一位英雄，
            <br />
            都有自己的故事。
          </p>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            在这里管理你的账号、角色与服务器旅程。下一次登录时，继续从你离开的地方出发。
          </p>
        </div>
        <p className="relative text-xs text-slate-500">A community portal for Azeroth.</p>
      </aside>
      <main id="main-content" className="relative flex min-h-svh items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute right-5 top-5 sm:right-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            返回首页
          </Link>
          {children}
        </div>
      </main>
    </div>
  )
}
