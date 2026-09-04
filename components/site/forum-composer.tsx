"use client"

import { ArrowRight, MessageSquarePlus, X } from "lucide-react"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { copy } from "@/lib/i18n"

export function ForumComposer() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const hasError = Boolean(status && status !== copy.forum.topicSuccess)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim() || !message.trim()) {
      setStatus("请填写主题标题和内容。")
      return
    }

    setStatus(copy.forum.topicSuccess)
    setTitle("")
    setMessage("")
  }

  if (!open) {
    return (
      <Button size="lg" onClick={() => setOpen(true)}>
        <MessageSquarePlus data-icon="inline-start" aria-hidden="true" />
        {copy.forum.newTopic}
      </Button>
    )
  }

  return (
    <div className="glass-surface w-full rounded-2xl border border-primary/25 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">New discussion</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{copy.forum.newTopicTitle}</h2>
        </div>
        <Button variant="ghost" size="icon" aria-label="关闭发布主题" onClick={() => setOpen(false)}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field data-invalid={hasError}>
            <FieldLabel htmlFor="forum-topic-title">{copy.forum.topicTitle}</FieldLabel>
            <Input
            id="forum-topic-title"
            className="field-input"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setStatus("")
            }}
            placeholder={copy.forum.topicTitlePlaceholder}
            aria-invalid={hasError || undefined}
            />
          </Field>
          <Field data-invalid={hasError}>
            <FieldLabel htmlFor="forum-topic-message">{copy.forum.topicContent}</FieldLabel>
            <Textarea
            id="forum-topic-message"
            className="field-input min-h-32 resize-y py-3"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value)
              setStatus("")
            }}
            placeholder={copy.forum.topicContentPlaceholder}
            aria-invalid={hasError || undefined}
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          {status ? (
            <GlassNotice tone={status === copy.forum.topicSuccess ? "success" : "error"}>
              {status}
            </GlassNotice>
          ) : <span />}
          <Button type="submit">
            {copy.forum.publishTopic}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  )
}
