import Link from "next/link"
import { ArrowLeft, Search, Swords } from "lucide-react"

import { CharacterCard } from "@/components/site/character-card"
import { portalDataProvider } from "@/lib/portal-data-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireSession } from "@/lib/auth"

export const metadata = {
  title: "我的角色",
}

export default async function AccountCharactersPage() {
  const session = await requireSession()
  const profile = await portalDataProvider.getPlayerProfile(session.accountId)
  const highestItemLevel = profile.characters.length
    ? Math.max(...profile.characters.map((character) => character.itemLevel))
    : 0

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回总览
      </Link>

      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Character roster</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">我的角色</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">查看与你的玩家账号关联的角色档案。</p>
        </div>
        <Swords className="hidden size-7 text-primary sm:block" aria-hidden="true" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "全部角色", value: profile.characters.length },
          {
            label: "同阵营角色",
            value: profile.characters.filter((character) => character.faction === profile.faction).length,
          },
          { label: "最高装备等级", value: highestItemLevel },
        ].map((stat) => (
          <Card key={stat.label} size="sm" className="glass-surface">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-2xl font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card size="sm" className="glass-surface mt-8">
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <Search className="size-4" aria-hidden="true" />
          <p>角色列表来自 Mock provider</p>
        </CardContent>
      </Card>

      {profile.characters.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {profile.characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      ) : (
        <Card size="sm" className="glass-surface mt-4">
          <CardHeader>
            <CardTitle>还没有角色</CardTitle>
            <CardDescription>创建角色后，它们会显示在这里。</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
