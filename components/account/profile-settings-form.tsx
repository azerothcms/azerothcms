"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { setClientSession } from "@/lib/session"
import type { PlayerProfile } from "@/lib/types"

export function ProfileSettingsForm({ profile }: { profile: PlayerProfile }) {
  return <ProfileSettingsFields profile={profile} />
}

function ProfileSettingsFields({ profile }: {
  profile: PlayerProfile
}) {
  const username = profile.username
  const [email, setEmail] = useState(profile.email)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    setSaved(false)
    setError("")

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("请输入有效的邮箱地址。")
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const result = (await response.json()) as {
        error?: string
        session?: Parameters<typeof setClientSession>[0]
      }

      if (!response.ok || !result.session) {
        setError(result.error ?? "更新账号资料失败。")
        return
      }

      setClientSession(result.session)
      setEmail(normalizedEmail)
      setSaved(true)
    } catch {
      setError("无法连接账号服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="flex max-w-2xl flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="profile-username">用户名</FieldLabel>
          <Input
            id="profile-username"
            className="field-input"
            value={username}
            readOnly
            aria-describedby="profile-username-description"
          />
          <p
            id="profile-username-description"
            className="text-xs text-muted-foreground"
          >
            TrinityCore 用户名用于 SRP6 登录，不能直接修改。
          </p>
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-email">邮箱地址</FieldLabel>
          <Input
            id="profile-email"
            type="email"
            className="field-input"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setSaved(false)
              setError("")
            }}
            aria-invalid={Boolean(error) || undefined}
          />
        </Field>
      </FieldGroup>
      <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
        邮箱会写入 TrinityCore 的 <code>auth.account.email</code>；邮箱验证流程尚未接入。
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中……" : "保存设置"}
        </Button>
        {error ? <GlassNotice tone="error">{error}</GlassNotice> : null}
        {saved ? <GlassNotice tone="success">设置已保存</GlassNotice> : null}
      </div>
    </form>
  )
}
