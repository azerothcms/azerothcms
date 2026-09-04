"use client"

import { Plus } from "lucide-react"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import type { GameAccount } from "@/lib/types"

export function GameAccountActions({
  onCreated,
}: {
  onCreated: (account: GameAccount) => void
}) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("")

    if (!/^[A-Za-z0-9_]{3,16}$/.test(username.trim())) {
      setStatus("游戏账号需为 3-16 位字母、数字或下划线。")
      return
    }

    const passwordLength = Array.from(password).length

    if (passwordLength < 8 || passwordLength > 16) {
      setStatus("密码长度必须为 8-16 个字符，以兼容 TrinityCore。")
      return
    }

    if (password !== confirmPassword) {
      setStatus("两次输入的密码不一致。")
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/account/game-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const result = (await response.json()) as {
        error?: string
        gameAccount?: GameAccount
      }

      if (!response.ok || !result.gameAccount) {
        setStatus(result.error ?? "创建游戏账号失败，请稍后重试。")
        return
      }

      onCreated(result.gameAccount)
      setUsername("")
      setPassword("")
      setConfirmPassword("")
      setStatus("游戏账号已创建并关联到当前玩家中心。")
    } catch {
      setStatus("无法连接账号服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <Button
        variant={open ? "outline" : "default"}
        onClick={() => {
          setOpen((value) => !value)
          setStatus("")
        }}
      >
        <Plus data-icon="inline-start" aria-hidden="true" />
        {open ? "收起创建" : "创建游戏账号"}
      </Button>
      {open ? (
        <form
          className="mt-4 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <FieldGroup className="sm:grid sm:grid-cols-3">
            <Field data-invalid={Boolean(status)}>
              <FieldLabel htmlFor="new-game-account">账号名称</FieldLabel>
              <Input
                id="new-game-account"
                className="field-input"
                placeholder="3-16 位字母、数字或下划线"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setStatus("")
                }}
                autoComplete="username"
                required
                aria-invalid={Boolean(status) || undefined}
              />
            </Field>
            <Field data-invalid={Boolean(status)}>
              <FieldLabel htmlFor="new-game-account-password">登录密码</FieldLabel>
              <Input
                id="new-game-account-password"
                type="password"
                className="field-input"
                placeholder="8-16 个字符"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setStatus("")
                }}
                autoComplete="new-password"
                minLength={8}
                maxLength={16}
                required
                aria-invalid={Boolean(status) || undefined}
              />
            </Field>
            <Field data-invalid={Boolean(status)}>
              <FieldLabel htmlFor="confirm-game-account-password">确认密码</FieldLabel>
              <Input
                id="confirm-game-account-password"
                type="password"
                className="field-input"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setStatus("")
                }}
                autoComplete="new-password"
                minLength={8}
                maxLength={16}
                required
                aria-invalid={Boolean(status) || undefined}
              />
            </Field>
          </FieldGroup>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              新账号会写入 TrinityCore auth.account，并与当前玩家中心建立关联。
            </p>
            <Button type="submit" disabled={pending}>
              {pending ? "创建中……" : "确认创建"}
            </Button>
          </div>
        </form>
      ) : null}
      {status ? (
        <GlassNotice className="mt-3" tone={status.includes("已创建") ? "success" : "error"}>
          {status}
        </GlassNotice>
      ) : null}
    </div>
  )
}
