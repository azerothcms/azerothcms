import Link from "next/link"
import { Activity, ArrowLeft, Clock3, Server, Users } from "lucide-react"

import { RealmCard } from "@/components/site/realm-card"
import { SectionHeading } from "@/components/site/section-heading"
import { StatusBadge } from "@/components/site/status-badge"
import { portalDataProvider } from "@/lib/portal-data-provider"

export const metadata = {
  title: "服务器状态",
  description: "查看 Azeroth CMS 各个 Realm 的实时在线状态。",
}

export default async function RealmsPage() {
  const realms = await portalDataProvider.getRealms()
  const onlineCount = realms.filter((realm) => realm.status === "online").length
  const totalPlayers = realms.reduce((total, realm) => total + realm.onlinePlayers, 0)

  return (
    <div className="content-shell page-section">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回首页
      </Link>
      <SectionHeading
        className="mt-8"
        eyebrow="Realm status"
        title="服务器状态"
        description="选择一个 Realm，开始你的下一段冒险。状态与在线人数来自 TrinityCore。"
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { label: "活跃 Realm", value: `${onlineCount}/${realms.length}`, icon: Server },
          { label: "当前在线", value: totalPlayers.toLocaleString(), icon: Users },
          { label: "平均可用性", value: "99.55%", icon: Activity },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl border border-border/80 bg-card p-5">
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <p className="mt-5 font-mono text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {realms.map((realm) => (
          <div key={realm.id} id={realm.slug} className="scroll-mt-28">
            <RealmCard realm={realm} />
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/35 p-5 text-sm text-muted-foreground">
        <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>服务器状态和在线人数由 TrinityCore 的 realmlist 实时提供；可用性统计仍需接入历史 uptime 数据。</p>
        <StatusBadge status="online" />
      </div>
    </div>
  )
}
