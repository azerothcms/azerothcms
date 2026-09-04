"use client"

import { FormEvent, useCallback, useState, useSyncExternalStore } from "react"

import { ForumEditor, getEditorText } from "@/components/site/forum-editor"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { copy } from "@/lib/i18n"
import {
  getMockForumServerSnapshot,
  getMockRepliesSnapshot,
  readMockReplies,
  subscribeMockReplies,
  writeMockReplies,
} from "@/lib/mock-forum-storage"

type ForumThreadActionsProps = {
  threadSlug: string
}

export function ForumThreadActions({ threadSlug }: ForumThreadActionsProps) {
  const [reply, setReply] = useState("")
  const [status, setStatus] = useState("")
  const subscribeToReplies = useCallback(
    (listener: () => void) => subscribeMockReplies(threadSlug, listener),
    [threadSlug]
  )
  const getRepliesSnapshot = useCallback(
    () => getMockRepliesSnapshot(threadSlug),
    [threadSlug]
  )
  const repliesSnapshot = useSyncExternalStore(
    subscribeToReplies,
    getRepliesSnapshot,
    getMockForumServerSnapshot
  )
  const submittedReplies = repliesSnapshot ? readMockReplies(threadSlug) : []
  const hasError = Boolean(status && status !== copy.forum.replySuccess)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = getEditorText(reply)
    if (!content) {
      setStatus("请输入回复内容。")
      return
    }

    const nextReplies = [
      ...submittedReplies,
      {
        id: `${threadSlug}-${submittedReplies.length + 1}`,
        content,
      },
    ]
    writeMockReplies(threadSlug, nextReplies)
    setStatus(copy.forum.replySuccess)
    setReply("")
  }

  return (
    <section className="mt-8 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
      <div>
        <p className="eyebrow">Join the conversation</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          {copy.forum.reply}
        </h2>
      </div>
      {submittedReplies.length ? (
        <div className="mt-5 flex flex-col gap-3" aria-live="polite">
          <p className="eyebrow">{copy.forum.replyPreview}</p>
          {submittedReplies.map((submittedReply) => (
            <div
              key={submittedReply.id}
              className="rounded-xl border border-primary/20 bg-primary/6 p-4"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {copy.forum.previewAuthor}
                </span>
                <span>刚刚</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {submittedReply.content}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      <form className="mt-5" onSubmit={handleSubmit}>
        <Field data-invalid={hasError}>
          <FieldLabel htmlFor="forum-reply">{copy.forum.replyLabel}</FieldLabel>
          <ForumEditor
            id="forum-reply"
            value={reply}
            onChange={(value) => {
              setReply(value)
              setStatus("")
            }}
            placeholder={copy.forum.replyPlaceholder}
            invalid={hasError}
          />
        </Field>
        <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          {status ? (
            <GlassNotice
              tone={status === copy.forum.replySuccess ? "success" : "error"}
            >
              {status}
            </GlassNotice>
          ) : (
            <span />
          )}
          <Button type="submit">发布回复</Button>
        </div>
      </form>
    </section>
  )
}
