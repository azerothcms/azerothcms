import Link from "next/link"
import { ArrowUpRight, Gauge, Users } from "lucide-react"

import { StatusBadge } from "@/components/site/status-badge"
import { copy } from "@/lib/i18n"
import type { Realm } from "@/lib/types"

export function RealmCard({ realm }: { realm: Realm }) {
  const population = realm.maxPlayers ? realm.onlinePlayers / realm.maxPlayers : 0
  const statusDotClass = {
    online: "bg-emerald-400 shadow-[0_0_12px_currentColor]",
    offline: "bg-muted-foreground",
    maintenance: "bg-primary shadow-[0_0_12px_currentColor]",
  }[realm.status]

  return (
    <div className="glass-surface rounded-2xl border p-5 transition hover:border-primary/35">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${statusDotClass}`} />
            <h3 className="font-semibold text-foreground">{realm.name}</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {realm.expansion} · {realm.type}
          </p>
        </div>
        <StatusBadge status={realm.status} />
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
            {realm.onlinePlayers.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.common.players}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden="true" />
            {Math.round(population * 100)}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="size-3.5" aria-hidden="true" />
            {realm.uptime}
          </span>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(population * 100, realm.status === "online" ? 4 : 0)}%` }}
        />
      </div>
      <Link
        href={`/realms#${realm.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        查看服务器详情
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}
