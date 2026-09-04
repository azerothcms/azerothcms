"use client"

import { CheckCircle2, Gamepad2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameAccount } from "@/lib/types"

export function GameAccountCount({ initialCount }: { initialCount: number }) {
  return (
    <p className="truncate font-mono text-2xl font-semibold text-foreground">
      {initialCount}
    </p>
  )
}

export function GameAccountList({
  accounts,
}: {
  accounts: GameAccount[]
}) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      {accounts.map((account) => (
        <Card key={account.id} className="glass-surface">
          <CardHeader>
            <div className="flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <Gamepad2 className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{account.username}</CardTitle>
                  <Badge
                    variant={
                      account.status === "active" ? "secondary" : "outline"
                    }
                  >
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
                <CheckCircle2
                  className="size-5 text-primary"
                  aria-label="账号正常"
                />
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="hidden" />
        </Card>
      ))}
    </div>
  )
}
