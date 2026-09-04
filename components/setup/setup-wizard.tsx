"use client"

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clipboard,
  Database,
  RefreshCcw,
  Server,
  ShieldCheck,
} from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { setClientSession } from "@/lib/session"
import type { SessionState, SetupCheck, SetupStatus } from "@/lib/types"

const CMS_COMMAND = "mysql -h127.0.0.1 -uroot -p < /home/wolone/azerothcms/sql/cms.sql"

function StatusIcon({ state }: { state: SetupCheck["state"] }) {
  if (state === "ready") {
    return <CheckCircle2 className="text-chart-4" aria-hidden="true" />
  }

  return <CircleAlert className="text-primary" aria-hidden="true" />
}

function StatusRow({
  icon,
  label,
  check,
}: {
  icon: React.ReactNode
  label: string
  check: SetupCheck
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/35 p-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <StatusIcon state={check.state} />
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{check.message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">数据库：{check.database}</p>
      </div>
    </div>
  )
}

export function SetupWizard() {
  const router = useRouter()
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [copied, setCopied] = useState(false)

  async function loadStatus() {
    setChecking(true)

    try {
      const response = await fetch("/api/setup/status", { cache: "no-store" })
      const nextStatus = (await response.json()) as SetupStatus
      setStatus(nextStatus)
      setError("")
    } catch {
      setError("无法读取初始化状态，请确认应用服务正在运行。")
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadStatus(), 0)

    return () => window.clearTimeout(timer)
  }, [])

  async function copyCommand() {
    await navigator.clipboard.writeText(CMS_COMMAND)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!/^[A-Za-z0-9_]{3,16}$/.test(username.trim())) {
      setError("管理员账号需为 3-16 位字母、数字或下划线。")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("请输入有效的管理员邮箱。")
      return
    }

    const passwordLength = Array.from(password).length
    if (passwordLength < 8 || passwordLength > 16) {
      setError("管理员密码需为 8-16 个字符。")
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。")
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      })
      const result = (await response.json()) as {
        error?: string
        session?: SessionState
      }

      if (!response.ok || !result.session) {
        setError(result.error ?? "初始化失败，请检查数据库连接。")
        return
      }

      setClientSession(result.session)
      router.push("/admin")
      router.refresh()
    } catch {
      setError("无法连接初始化服务，请稍后重试。")
    } finally {
      setPending(false)
    }
  }

  const authReady = status?.auth.state === "ready"
  const cmsReady = status?.cms.state === "ready"
  const setupCompleted = Boolean(status && !status.setupRequired)

  return (
    <main className="relative min-h-svh overflow-hidden px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
      </div>
      <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-3xl items-center">
        <div className="w-full">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">Azeroth CMS</p>
              <p className="mt-1 text-sm text-muted-foreground">首次启动初始化向导</p>
            </div>
          </div>

          <Card className="glass-surface border-primary/15">
            <CardHeader className="gap-3 p-6 sm:p-8">
              <p className="page-kicker w-fit">Setup assistant</p>
              <CardTitle className="text-3xl tracking-tight sm:text-4xl">准备你的门户</CardTitle>
              <CardDescription className="max-w-2xl leading-6">
                向导会检查 TrinityCore 数据库，并创建第一个 AzerothCMS 管理员。密码只会写入 TrinityCore 的 SRP6
                字段，不会保存明文。
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
              {loading ? (
                <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
                  <RefreshCcw className="animate-spin" aria-hidden="true" />
                  正在检查数据库连接……
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {status ? (
                      <>
                        <StatusRow
                          icon={<Server aria-hidden="true" />}
                          label="TrinityCore 认证库"
                          check={status.auth}
                        />
                        <StatusRow
                          icon={<Database aria-hidden="true" />}
                          label="CMS 门户库"
                          check={status.cms}
                        />
                      </>
                    ) : null}
                  </div>

                  {status && !cmsReady ? (
                    <GlassNotice tone="info">
                      CMS 库尚未就绪。可先创建管理员；要启用新闻、论坛和后台内容持久化，请使用具备权限的账号执行
                      <code className="mx-1 rounded bg-muted px-1.5 py-0.5">sql/cms.sql</code>。
                    </GlassNotice>
                  ) : null}

                  {!authReady ? (
                    <GlassNotice tone="error">
                      请先确认环境变量和 TrinityCore auth 数据库结构，再点击右上方的重新检查。
                    </GlassNotice>
                  ) : null}

                  <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/25 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">CMS 数据库初始化命令</p>
                        <p className="mt-1 text-xs text-muted-foreground">需要在服务器终端使用具备 CREATE/GRANT 权限的账号执行。</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => void copyCommand()}>
                        <Clipboard data-icon="inline-start" aria-hidden="true" />
                        {copied ? "已复制" : "复制"}
                      </Button>
                    </div>
                    <code className="overflow-x-auto rounded-lg bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                      {CMS_COMMAND}
                    </code>
                  </div>

                  {setupCompleted ? (
                    <div className="flex flex-col gap-4">
                      <GlassNotice tone="success">
                        初始化已完成。当前浏览器可以直接进入管理后台。
                      </GlassNotice>
                      <Button
                        render={<Link href="/admin" />}
                        nativeButton={false}
                        size="lg"
                        className="w-full justify-between"
                      >
                        进入管理后台
                        <ArrowRight data-icon="inline-end" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : (
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                      <div>
                        <p className="eyebrow">Administrator</p>
                        <h2 className="mt-2 text-xl font-semibold text-foreground">创建首个管理员</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          只有在当前 auth 库还没有管理员时可用，后续管理员请从后台创建。
                        </p>
                      </div>
                      <FieldGroup>
                        <Field data-invalid={Boolean(error)}>
                          <FieldLabel htmlFor="setup-username">管理员账号</FieldLabel>
                          <Input
                            id="setup-username"
                            className="field-input"
                            autoComplete="username"
                            value={username}
                            onChange={(event) => {
                              setUsername(event.target.value)
                              setError("")
                            }}
                            placeholder="例如 AzerothAdmin"
                            aria-invalid={Boolean(error) || undefined}
                            disabled={!authReady || pending}
                          />
                          <FieldDescription>3-16 位字母、数字或下划线。</FieldDescription>
                        </Field>
                        <Field data-invalid={Boolean(error)}>
                          <FieldLabel htmlFor="setup-email">管理员邮箱</FieldLabel>
                          <Input
                            id="setup-email"
                            type="email"
                            className="field-input"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => {
                              setEmail(event.target.value)
                              setError("")
                            }}
                            placeholder="admin@example.com"
                            aria-invalid={Boolean(error) || undefined}
                            disabled={!authReady || pending}
                          />
                        </Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field data-invalid={Boolean(error)}>
                            <FieldLabel htmlFor="setup-password">管理员密码</FieldLabel>
                            <Input
                              id="setup-password"
                              type="password"
                              className="field-input"
                              autoComplete="new-password"
                              value={password}
                              onChange={(event) => {
                                setPassword(event.target.value)
                                setError("")
                              }}
                              placeholder="至少 8 个字符"
                              aria-invalid={Boolean(error) || undefined}
                              disabled={!authReady || pending}
                            />
                          </Field>
                          <Field data-invalid={Boolean(error)}>
                            <FieldLabel htmlFor="setup-confirm-password">确认密码</FieldLabel>
                            <Input
                              id="setup-confirm-password"
                              type="password"
                              className="field-input"
                              autoComplete="new-password"
                              value={confirmPassword}
                              onChange={(event) => {
                                setConfirmPassword(event.target.value)
                                setError("")
                              }}
                              placeholder="再次输入密码"
                              aria-invalid={Boolean(error) || undefined}
                              disabled={!authReady || pending}
                            />
                          </Field>
                        </div>
                      </FieldGroup>
                      {error ? <GlassNotice tone="error">{error}</GlassNotice> : null}
                      <Button type="submit" size="lg" disabled={!authReady || pending} className="w-full justify-between">
                        {pending ? "正在初始化……" : "创建管理员并进入后台"}
                        <ArrowRight data-icon="inline-end" aria-hidden="true" />
                      </Button>
                    </form>
                  )}

                  <div className="flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
                    <span>
                      {status ? `${status.auth.accounts} 个账号 · ${status.auth.realms} 个 Realm` : "等待检查"}
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void loadStatus()} disabled={checking}>
                      <RefreshCcw data-icon="inline-start" aria-hidden="true" />
                      {checking ? "检查中" : "重新检查"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            初始化向导只在 auth 库没有管理员时强制显示。
          </p>
        </div>
      </div>
    </main>
  )
}
