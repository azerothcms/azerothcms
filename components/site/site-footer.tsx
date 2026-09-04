import Link from "next/link"
import { Shield } from "lucide-react"

import { copy } from "@/lib/i18n"

export function SiteFooter() {
  return (
    <footer className="glass-toolbar border-t">
      <div className="content-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <Shield className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{copy.brand}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              为社区而生的艾泽拉斯入口。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link className="hover:text-foreground" href="/news">
            社区动态
          </Link>
          <Link className="hover:text-foreground" href="/realms">
            服务器状态
          </Link>
          <Link className="hover:text-foreground" href="/account">
            玩家中心
          </Link>
          <Link className="hover:text-foreground" href="/forums">
            论坛
          </Link>
          <Link className="hover:text-foreground" href="/shop">
            商城
          </Link>
          <span>© 2026 Azeroth CMS</span>
        </div>
      </div>
    </footer>
  )
}
