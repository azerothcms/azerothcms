"use client"

import { Plus } from "lucide-react"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { copy } from "@/lib/i18n"

export function GameAccountActions() {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [created, setCreated] = useState(false)
  const [error, setError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim()) {
      setCreated(false)
      setError(true)
      return
    }

    setCreated(true)
    setError(false)
    setUsername("")
  }

  return (
    <div>
      <Button variant={open ? "outline" : "default"} onClick={() => setOpen((value) => !value)}>
        <Plus data-icon="inline-start" aria-hidden="true" />
        创建游戏账号
      </Button>
      {open ? (
        <form className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row" onSubmit={handleSubmit} noValidate>
          <FieldGroup className="min-w-0 flex-1">
            <Field data-invalid={error}>
              <FieldLabel className="sr-only" htmlFor="new-game-account">
                新游戏账号名称
              </FieldLabel>
              <Input
                id="new-game-account"
                className="field-input"
                placeholder="输入新的游戏账号名称"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  setCreated(false)
                  setError(false)
                }}
                aria-invalid={error || undefined}
              />
            </Field>
          </FieldGroup>
          <Button type="submit">确认创建</Button>
        </form>
      ) : null}
      {error ? <GlassNotice className="mt-3" tone="error">{copy.account.gameAccountRequired}</GlassNotice> : null}
      {created ? (
        <GlassNotice className="mt-3" tone="success">游戏账号已加入演示列表。</GlassNotice>
      ) : null}
    </div>
  )
}
