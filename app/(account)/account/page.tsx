import Link from "next/link"
import { ArrowUpRight, CalendarDays, ChevronRight, Gamepad2, Shield, Swords, Trophy, Users } from "lucide-react"

import { AccountGreeting } from "@/components/account/account-greeting"
import { CharacterCard } from "@/components/site/character-card"
import { StatusBadge } from "@/components/site/status-badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { mockPortalDataProvider } from "@/lib/mock-data"

export const metadata = {
  title: "玩家中心",
}

export default async function AccountOverviewPage() {
  const profile = await mockPortalDataProvider.getPlayerProfile()
  const realms = await mockPortalDataProvider.getRealms()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Player dashboard</p>
          <AccountGreeting fallback={profile.username} />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">这里是你的艾泽拉斯控制台。</p>
        </div>
        <Link href="/armory" className="secondary-action self-start sm:self-auto">
          探索 Armory
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "游戏账号", value: profile.gameAccounts.length, icon: Gamepad2 },
          { label: "我的角色", value: profile.characters.length, icon: Swords },
          { label: "成就点数", value: "29,620", icon: Trophy },
          { label: "加入时间", value: profile.memberSince, icon: CalendarDays },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.label} size="sm" className="glass-surface">
              <CardHeader>
                <Icon className="size-4 text-primary" aria-hidden="true" />
                <CardTitle className="mt-4 text-xs text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="truncate font-mono text-2xl font-semibold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>最近的角色</CardTitle>
            <CardDescription>最近查看或活跃的角色档案。</CardDescription>
            <CardAction>
              <Link href="/account/characters" className="text-link">
                查看全部
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {profile.characters.slice(0, 2).map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface">
          <CardHeader>
            <CardTitle>服务器概览</CardTitle>
            <CardDescription>当前 Realm 的在线状态。</CardDescription>
            <CardAction>
              <Users className="size-5 text-primary" aria-hidden="true" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {realms.map((realm, index) => (
                <div key={realm.id}>
                  {index > 0 ? <Separator /> : null}
                  <div className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{realm.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {realm.onlinePlayers.toLocaleString()} 在线玩家
                      </p>
                    </div>
                    <StatusBadge status={realm.status} />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/realms" className="text-link mt-7">
              查看所有服务器
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-surface mt-6">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Shield className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">你的账号受到保护</p>
              <p className="mt-1 text-sm text-muted-foreground">完成邮箱验证后可解锁更多玩家中心功能。</p>
            </div>
          </div>
          <Link href="/account/settings" className="text-link shrink-0">
            前往设置
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
