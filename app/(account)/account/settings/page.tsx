import Link from "next/link"
import { ArrowLeft, Settings2 } from "lucide-react"

import { ProfileSettingsForm } from "@/components/account/profile-settings-form"
import { portalDataProvider } from "@/lib/portal-data-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireSession } from "@/lib/auth"

export const metadata = {
  title: "账号设置",
}

export default async function AccountSettingsPage() {
  const session = await requireSession()
  const profile = await portalDataProvider.getPlayerProfile(session.accountId)

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />返回总览</Link>
      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Account settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">账号设置</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">更新你的个人信息与玩家中心偏好。</p>
        </div>
        <Settings2 className="hidden size-7 text-primary sm:block" aria-hidden="true" />
      </div>
      <Card className="glass-surface mt-8">
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>更新玩家中心展示的用户名与邮箱地址。</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  )
}
