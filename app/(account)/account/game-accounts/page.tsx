import Link from "next/link"
import { ArrowLeft, LockKeyhole } from "lucide-react"

import { GameAccountActions } from "@/components/account/game-account-actions"
import { portalDataProvider } from "@/lib/portal-data-provider"
import { GameAccountList } from "@/components/account/game-account-list"
import { Card, CardContent } from "@/components/ui/card"
import { requireSession } from "@/lib/auth"

export const metadata = {
  title: "游戏账号",
}

export default async function GameAccountsPage() {
  const session = await requireSession()
  const profile = await portalDataProvider.getPlayerProfile(session.accountId)

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回总览
      </Link>

      <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Game accounts</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            游戏账号
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            管理你用于登录服务器的游戏账号。
          </p>
        </div>
        <GameAccountActions initialAccounts={profile.gameAccounts} />
      </div>

      <GameAccountList initialAccounts={profile.gameAccounts} />

      <Card size="sm" className="glass-surface mt-8">
        <CardContent className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <LockKeyhole className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>账号状态与角色数量来自 TrinityCore auth 和 characters 数据库；新增游戏账号功能需后续接入核心服务。</p>
        </CardContent>
      </Card>
    </div>
  )
}
