import Link from "next/link"
import { ArrowLeft, CheckCircle2, Gamepad2, LockKeyhole } from "lucide-react"

import { GameAccountActions } from "@/components/account/game-account-actions"
import { mockPortalDataProvider } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "游戏账号",
}

export default async function GameAccountsPage() {
  const profile = await mockPortalDataProvider.getPlayerProfile()

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回总览
      </Link>

      <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Game accounts</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">游戏账号</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">管理你用于登录服务器的游戏账号。</p>
        </div>
        <GameAccountActions />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {profile.gameAccounts.map((account) => (
          <Card key={account.id} className="glass-surface">
            <CardHeader>
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Gamepad2 className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{account.username}</CardTitle>
                    <Badge variant={account.status === "active" ? "secondary" : "outline"}>
                      {account.status === "active" ? "正常" : "已锁定"}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">
                    {account.expansion} · {account.characterCount} 个角色
                  </CardDescription>
                </div>
              </div>
              <CardAction>
                <div className="flex items-center gap-5 text-right text-xs text-muted-foreground">
                  <div>
                    <p className="text-foreground">{account.lastLogin}</p>
                    <p className="mt-1">最近登录</p>
                  </div>
                  <CheckCircle2 className="size-5 text-primary" aria-label="账号正常" />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="hidden" />
          </Card>
        ))}
      </div>

      <Card size="sm" className="glass-surface mt-8">
        <CardContent className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <LockKeyhole className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>账号管理在原型阶段仅展示本地演示状态。真实版本将通过核心适配器安全访问 auth 数据库。</p>
        </CardContent>
      </Card>
    </div>
  )
}
