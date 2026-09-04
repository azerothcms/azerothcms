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
  const [pending, setPending] = useState(false)
  const draftSnapshot = useSyncExternalStore(
    subscribeMockNewsDraft,
    getMockNewsDraftSnapshot,
    getMockAdminServerSnapshot
  )
  const createdDraft = draftSnapshot ? readMockNewsDraft() : null
  const hasError = Boolean(status && status !== copy.admin.newsDraftSuccess)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const body = getEditorText(content)
    if (!title.trim() || !body) {
      setStatus(copy.admin.newsRequired)
      return
    }

    setPending(true)

    try {
      const response = await fetch("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "news_draft",
          payload: {
            title: title.trim(),
            content: [body],
            category: "社区",
            excerpt: body.slice(0, 180),
            publishedAt: new Date().toISOString().slice(0, 10),
            readTime: "1 分钟",
            featured: false,
            accent: "blue",
            status: "draft",
          },
        }),
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        setStatus(result.error ?? "保存 CMS 草稿失败。")
        return
      }

      writeMockNewsDraft({ title: title.trim(), content: body })
      setStatus(copy.admin.newsDraftSuccess)
      setTitle("")
      setContent("")
    } catch {
      setStatus("无法连接 CMS 服务，请稍后重试。")
    } finally {
      setPending(false)
    }
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
            <Button type="submit" disabled={pending}>
              创建草稿
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
