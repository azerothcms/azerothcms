import { Activity, Gauge, Server } from "lucide-react"

import { AdminRealmActions } from "@/components/admin/admin-realm-actions"
import { SectionHeading } from "@/components/site/section-heading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { portalDataProvider } from "@/lib/portal-data-provider"

export const metadata = { title: "Realm 管理" }

export default async function AdminRealmsPage() {
  const realms = await portalDataProvider.getRealms()

  return (
    <div className="mx-auto max-w-6xl">
      <SectionHeading eyebrow="Realm management" title="Realm 管理" description="查看服务器负载，并演示切换在线与维护状态。" />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {realms.map((realm) => (
          <Card key={realm.id} className="glass-surface">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Server className="size-4" aria-hidden="true" />
              </div>
              <CardTitle className="mt-2 text-xl">{realm.name}</CardTitle>
              <CardDescription>{realm.expansion} · {realm.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <Gauge className="size-3.5 text-primary" aria-hidden="true" />
                  <p className="mt-3 font-mono text-lg font-semibold text-foreground">{realm.onlinePlayers.toLocaleString()}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">在线玩家</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <Activity className="size-3.5 text-primary" aria-hidden="true" />
                  <p className="mt-3 font-mono text-lg font-semibold text-foreground">{realm.uptime}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">可用性</p>
                </div>
              </div>
              <AdminRealmActions realm={realm} />
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">状态切换会写入 CMS 的 Realm 覆盖表；在线人数采集、维护窗口和操作审计仍需后续接入。</p>
    </div>
  )
}
