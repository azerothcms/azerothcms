"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Textarea } from "@/components/ui/textarea"
import { copy } from "@/lib/i18n"

export function ForumThreadActions() {
  const [reply, setReply] = useState("")
  const [status, setStatus] = useState("")
  const hasError = Boolean(status && status !== copy.forum.replySuccess)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!reply.trim()) {
      setStatus("请输入回复内容。")
      return
    }

    setStatus(copy.forum.replySuccess)
    setReply("")
  }

  return (
    <section className="mt-8 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
      <div>
        <p className="eyebrow">Join the conversation</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">{copy.forum.reply}</h2>
      </div>
      <form className="mt-5" onSubmit={handleSubmit}>
        <Field data-invalid={hasError}>
          <FieldLabel htmlFor="forum-reply">{copy.forum.replyLabel}</FieldLabel>
          <Textarea
            id="forum-reply"
            className="field-input min-h-32 resize-y py-3"
            value={reply}
            onChange={(event) => {
              setReply(event.target.value)
              setStatus("")
            }}
            placeholder={copy.forum.replyPlaceholder}
            aria-invalid={hasError || undefined}
          />
        </Field>
        <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          {status ? (
            <GlassNotice tone={status === copy.forum.replySuccess ? "success" : "error"}>
              {status}
            </GlassNotice>
          ) : <span />}
          <Button type="submit">发布回复</Button>
        </div>
      </form>
    </section>
  )
}
