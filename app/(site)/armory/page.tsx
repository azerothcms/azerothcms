import Link from "next/link"
import { ArrowLeft, Crown, Search, ShieldCheck } from "lucide-react"

import { ArmoryExplorer } from "@/components/site/armory-explorer"
import { SectionHeading } from "@/components/site/section-heading"
import { portalDataProvider } from "@/lib/portal-data-provider"

export const metadata = {
  title: "Armory",
  description: "搜索角色并查看装备、属性和成就。",
}

export default async function ArmoryPage() {
  const characters = await portalDataProvider.getCharacters()

  return (
    <div className="content-shell page-section">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回首页
      </Link>
      <SectionHeading
        className="mt-8"
        eyebrow="Character library"
        title="认识你的英雄"
        description="搜索服务器上的角色，查看他们的旅程、装备与社区归属。"
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { value: "2,846", label: "已记录角色", icon: Crown },
          { value: "18", label: "可探索职业", icon: Search },
          { value: "24/7", label: "持续同步", icon: ShieldCheck },
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
      <div className="mt-10">
        <ArmoryExplorer characters={characters} />
      </div>
    </div>
  )
}
