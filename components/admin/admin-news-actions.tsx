"use client"

import { ArrowRight, FilePlus2 } from "lucide-react"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { GlassNotice } from "@/components/ui/glass-notice"
import { Input } from "@/components/ui/input"

export function AdminNewsActions() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState("")
  const hasError = status === "请输入新闻标题。"

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setStatus("请输入新闻标题。")
      return
    }

    setStatus("新闻草稿已创建演示记录。")
    setTitle("")
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}><FilePlus2 data-icon="inline-start" aria-hidden="true" />新建新闻</Button>
  }

  return (
    <form className="flex w-full flex-col gap-3 rounded-xl border border-primary/25 bg-primary/6 p-4 sm:w-auto sm:flex-row sm:items-end" onSubmit={handleSubmit}>
      <Field className="min-w-64" data-invalid={hasError}>
        <FieldLabel htmlFor="admin-news-title">新闻标题</FieldLabel>
        <Input
          id="admin-news-title"
          className="field-input"
          value={title}
          onChange={(event) => { setTitle(event.target.value); setStatus("") }}
          placeholder="输入新闻标题"
          aria-invalid={hasError || undefined}
        />
      </Field>
      <Button type="submit">创建草稿<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>取消</Button>
      {status ? <GlassNotice className="text-xs sm:absolute sm:mt-24" tone={status.includes("请输入") ? "error" : "success"}>{status}</GlassNotice> : null}
    </form>
  )
}
