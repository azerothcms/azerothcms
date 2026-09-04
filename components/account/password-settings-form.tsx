"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"

export function PasswordSettingsForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    setError("")

    if (newPassword.length < 8 || newPassword.length > 16) {
      setError("新密码需为 8-16 个字符，以兼容 TrinityCore。")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致。")
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const result = (await response.json()) as { error?: string; saved?: boolean }

      if (!response.ok || !result.saved) {
        setError(result.error ?? "修改密码失败，请稍后重试。")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSaved(true)
    } catch {
      setError("无法连接账号服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="flex max-w-2xl flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="current-password">当前密码</FieldLabel>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            className="field-input"
            required
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value)
              setSaved(false)
              setError("")
            }}
            aria-invalid={Boolean(error) || undefined}
          />
        </Field>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="new-password">新密码</FieldLabel>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className="field-input"
            minLength={8}
            maxLength={16}
            required
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value)
              setSaved(false)
              setError("")
            }}
            aria-invalid={Boolean(error) || undefined}
          />
        </Field>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="confirm-new-password">确认新密码</FieldLabel>
          <Input
            id="confirm-new-password"
            type="password"
            autoComplete="new-password"
            className="field-input"
            minLength={8}
            maxLength={16}
            required
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              setSaved(false)
              setError("")
            }}
            aria-invalid={Boolean(error) || undefined}
          />
        </Field>
      </FieldGroup>
      <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
        密码会按 TrinityCore Grunt SRP6 格式重新生成 salt 与 verifier，网站不会保存明文密码。
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中……" : "修改密码"}
        </Button>
        {error ? <GlassNotice tone="error">{error}</GlassNotice> : null}
        {saved ? <GlassNotice tone="success">密码已修改</GlassNotice> : null}
      </div>
    </form>
  )
}
