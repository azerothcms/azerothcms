"use client"

import { ArrowRight, MessageSquarePlus, X } from "lucide-react"
import { FormEvent, useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { ForumEditor, getEditorText } from "@/components/site/forum-editor"
import { copy } from "@/lib/i18n"
import {
  getMockForumServerSnapshot,
  getMockTopicSnapshot,
  readMockTopic,
  subscribeMockTopic,
  writeMockTopic,
} from "@/lib/mock-forum-storage"

export function ForumComposer() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [pending, setPending] = useState(false)
  const topicSnapshot = useSyncExternalStore(
    subscribeMockTopic,
    getMockTopicSnapshot,
    getMockForumServerSnapshot
  )
  const submittedTopic = topicSnapshot ? readMockTopic() : null
  const hasError = Boolean(status && status !== copy.forum.topicSuccess)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const body = getEditorText(message)
    if (!title.trim() || !body) {
      setStatus("请填写主题标题和内容。")
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: body,
          categorySlug: "general",
        }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setStatus(result.error ?? "发布主题失败，请稍后重试。")
        return
      }

      writeMockTopic({ title: title.trim(), body })
      setStatus(copy.forum.topicSuccess)
      setTitle("")
      setMessage("")
    } catch {
      setStatus("无法连接论坛服务，请稍后重试。")
    } finally {
      setPending(false)
    }
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
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            {copy.forum.newTopicTitle}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="关闭发布主题"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {submittedTopic ? (
        <div
          className="mt-5 rounded-xl border border-primary/20 bg-primary/6 p-4"
          aria-live="polite"
        >
          <p className="eyebrow">{copy.forum.topicPreview}</p>
          <h3 className="mt-2 font-medium text-foreground">
            {submittedTopic.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {submittedTopic.body}
          </p>
        </div>
      ) : null}
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field data-invalid={hasError}>
            <FieldLabel htmlFor="forum-topic-title">
              {copy.forum.topicTitle}
            </FieldLabel>
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
            <FieldLabel htmlFor="forum-topic-message">
              {copy.forum.topicContent}
            </FieldLabel>
            <ForumEditor
              id="forum-topic-message"
              value={message}
              onChange={(value) => {
                setMessage(value)
                setStatus("")
              }}
              placeholder={copy.forum.topicContentPlaceholder}
              invalid={hasError}
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          {status ? (
            <GlassNotice
              tone={status === copy.forum.topicSuccess ? "success" : "error"}
            >
              {status}
            </GlassNotice>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "发布中……" : copy.forum.publishTopic}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  )
}
