"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import type { PlayerProfile } from "@/lib/types"

export function ProfileSettingsForm({ profile }: { profile: PlayerProfile }) {
  const [username, setUsername] = useState(profile.username)
  const [email, setEmail] = useState(profile.email)
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
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
            onChange={(event) => {
              setUsername(event.target.value)
              setSaved(false)
            }}
          />
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
            }}
          />
        </Field>
      </FieldGroup>
      <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
        这是 UI 原型，保存操作只展示成功状态，不会修改服务器账号资料。
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit">保存设置</Button>
        {saved ? <GlassNotice tone="success">设置已保存</GlassNotice> : null}
      </div>
    </form>
  )
}
