"use client"

import Link from "next/link"
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { copy } from "@/lib/i18n"
import { DEMO_CREDENTIALS, startDemoSession } from "@/lib/session"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState<string>(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email || !password) {
      setError(copy.auth.required)
      return
    }

    if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      setError(copy.auth.invalid)
      return
    }

    startDemoSession()
    router.push("/account")
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Player access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {copy.auth.welcome}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.auth.subtitle}</p>
      </div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="login-email">{copy.auth.email}</FieldLabel>
            <span className="input-with-icon">
            <Mail className="input-icon" aria-hidden="true" />
            <Input
              id="login-email"
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
            <FieldLabel htmlFor="login-password">{copy.auth.password}</FieldLabel>
            <span className="input-with-icon">
            <LockKeyhole className="input-icon" aria-hidden="true" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError("")
              }}
              className="field-input pl-10 pr-11"
              placeholder="••••••••"
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
        </FieldGroup>
        {error ? <GlassNotice tone="error">{error}</GlassNotice> : null}
        <Button type="submit" size="lg" className="h-11 w-full justify-between px-4">
          {copy.auth.login}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </form>
      <div className="mt-5 rounded-xl border border-primary/20 bg-primary/6 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <span className="font-medium text-primary">Demo</span> · {copy.auth.demoHint}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {copy.auth.noAccount}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {copy.auth.createNow}
        </Link>
      </p>
    </div>
  )
}
