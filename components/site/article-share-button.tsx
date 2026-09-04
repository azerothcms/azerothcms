"use client"

import { Share2 } from "lucide-react"
import { useState } from "react"

import { GlassNotice } from "@/components/ui/glass-notice"

export function ArticleShareButton({ title }: { title: string }) {
  const [status, setStatus] = useState<"success" | "error" | "">("")
  const [message, setMessage] = useState("")

  async function handleShare() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        setStatus("success")
        setMessage("文章链接已复制。")
        return
      }

      if (navigator.share) {
        await navigator.share({ title, url: window.location.href })
        setStatus("success")
        setMessage("分享面板已打开。")
        return
      }

      setStatus("success")
      setMessage("分享链接已就绪。")
    } catch {
      setStatus("error")
      setMessage("分享操作已取消。")
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        onClick={handleShare}
      >
        <Share2 className="size-4" aria-hidden="true" />
        分享文章
      </button>
      {status ? <GlassNotice className="px-2 py-1 text-xs" tone={status}>{message}</GlassNotice> : null}
    </div>
  )
}
