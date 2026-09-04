"use client"

import Link from "next/link"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { copy } from "@/lib/i18n"
import { setClientSession } from "@/lib/session"
import type { SessionState } from "@/lib/types"

export function RegisterForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim()

    if (!username.trim() || !normalizedEmail || !password || !confirmPassword) {
      setError(copy.auth.required)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(copy.auth.invalidEmail)
      return
    }

    const passwordLength = Array.from(password).length

    if (passwordLength < 8) {
      setError(copy.auth.passwordTooShort)
      return
    }

    if (passwordLength > 16) {
      setError(copy.auth.passwordTooLong)
      return
    }

    if (password !== confirmPassword) {
      setError(copy.auth.passwordMismatch)
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: normalizedEmail, password }),
      })
      const data = (await response.json()) as { error?: string; session?: SessionState }

      if (!response.ok || !data.session) {
        setError(data.error ?? "注册失败，请稍后重试。")
        return
      }

      setClientSession(data.session)
      router.push("/account")
    } catch {
      setError("无法连接认证服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Join the community</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">创建你的旅程</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          注册一个真实的 TrinityCore 游戏账号，并进入 Azeroth CMS 玩家中心。
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="register-username">{copy.auth.username}</FieldLabel>
            <span className="input-with-icon">
            <UserRound className="input-icon" aria-hidden="true" />
            <Input
              id="register-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setError("")
              }}
              className="field-input pl-10"
              placeholder="你的冒险者名字"
              required
              aria-invalid={Boolean(error) || undefined}
            />
            </span>
          </Field>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="register-email">{copy.auth.email}</FieldLabel>
            <span className="input-with-icon">
            <Mail className="input-icon" aria-hidden="true" />
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError("")
              }}
              className="field-input pl-10"
              placeholder="you@example.com"
              required
              aria-invalid={Boolean(error) || undefined}
            />
            </span>
          </Field>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="register-password">{copy.auth.password}</FieldLabel>
            <span className="input-with-icon">
            <LockKeyhole className="input-icon" aria-hidden="true" />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError("")
              }}
              className="field-input pl-10 pr-11"
              placeholder="至少 8 个字符"
              required
              aria-invalid={Boolean(error) || undefined}
            />
            <button
              type="button"
              className="input-action"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
              onClick={() => setShowPassword((show) => !show)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            </span>
          </Field>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="register-confirm-password">{copy.auth.confirmPassword}</FieldLabel>
            <span className="input-with-icon">
            <LockKeyhole className="input-icon" aria-hidden="true" />
            <Input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setError("")
              }}
              className="field-input pl-10"
              placeholder="再次输入密码"
              required
              aria-invalid={Boolean(error) || undefined}
            />
            </span>
          </Field>
        </FieldGroup>
        {error ? <GlassNotice tone="error">{error}</GlassNotice> : null}
        <Button type="submit" size="lg" disabled={pending} className="h-11 w-full justify-between px-4">
          {copy.auth.register}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {copy.auth.hasAccount}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {copy.auth.loginNow}
        </Link>
      </p>
    </div>
  )
}
