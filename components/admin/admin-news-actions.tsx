"use client"

import { ArrowRight, FilePlus2, X } from "lucide-react"
import { FormEvent, useState, useSyncExternalStore } from "react"

import { ForumEditor, getEditorText } from "@/components/site/forum-editor"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"
import { copy } from "@/lib/i18n"
import {
  getMockAdminServerSnapshot,
  getMockNewsDraftSnapshot,
  readMockNewsDraft,
  subscribeMockNewsDraft,
  writeMockNewsDraft,
} from "@/lib/mock-admin-storage"

export function AdminNewsActions() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("")
  const draftSnapshot = useSyncExternalStore(
    subscribeMockNewsDraft,
    getMockNewsDraftSnapshot,
    getMockAdminServerSnapshot
  )
  const createdDraft = draftSnapshot ? readMockNewsDraft() : null
  const hasError = Boolean(status && status !== copy.admin.newsDraftSuccess)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const body = getEditorText(content)
    if (!title.trim() || !body) {
      setStatus(copy.admin.newsRequired)
      return
    }

    writeMockNewsDraft({ title: title.trim(), content: body })
    setStatus(copy.admin.newsDraftSuccess)
    setTitle("")
    setContent("")
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <FilePlus2 data-icon="inline-start" aria-hidden="true" />
        {copy.admin.newNews}
      </Button>
    )
  }

  return (
    <div className="glass-surface w-full rounded-2xl border border-primary/25 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Content editor</p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            {copy.admin.newNews}
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="关闭新闻编辑器"
          onClick={() => setOpen(false)}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      {createdDraft ? (
        <div
          className="mt-5 rounded-xl border border-primary/20 bg-primary/6 p-4"
          aria-live="polite"
        >
          <p className="eyebrow">{copy.admin.newsDraftPreview}</p>
          <h3 className="mt-2 font-medium text-foreground">
            {createdDraft.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {createdDraft.content}
          </p>
        </div>
      ) : null}
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field data-invalid={hasError}>
            <FieldLabel htmlFor="admin-news-title">
              {copy.admin.newsTitle}
            </FieldLabel>
            <Input
              id="admin-news-title"
              className="field-input"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setStatus("")
              }}
              placeholder={copy.admin.newsTitlePlaceholder}
              aria-invalid={hasError || undefined}
            />
          </Field>
          <Field data-invalid={hasError}>
            <FieldLabel htmlFor="admin-news-content">
              {copy.admin.newsContent}
            </FieldLabel>
            <ForumEditor
              id="admin-news-content"
              value={content}
              onChange={(value) => {
                setContent(value)
                setStatus("")
              }}
              placeholder={copy.admin.newsContentPlaceholder}
              invalid={hasError}
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          {status ? (
            <GlassNotice tone={hasError ? "error" : "success"}>
              {status}
            </GlassNotice>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit">
              创建草稿
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
