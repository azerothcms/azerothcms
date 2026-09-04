import { randomUUID } from "node:crypto"

import type { ResultSetHeader } from "mysql2"
import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/auth"
import { cmsDb } from "@/lib/db"

const categories = new Set(["公告", "活动", "社区"])
const accents = new Set(["gold", "blue", "purple"])
const statuses = new Set(["draft", "published"])

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function isCmsConfigurationError(error: unknown) {
  return [
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
    "ER_ACCESS_DENIED_ERROR",
    "ER_DBACCESS_DENIED_ERROR",
    "ER_TABLEACCESS_DENIED_ERROR",
  ].includes((error as { code?: string }).code ?? "")
}

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return `${base || "news"}-${Date.now()}`
}

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || session.role !== "admin") {
    return errorResponse("需要管理员权限。", session.authenticated ? 403 : 401)
  }

  try {
    const body = (await request.json()) as {
      title?: unknown
      content?: unknown
      category?: unknown
      excerpt?: unknown
      publishedAt?: unknown
      readTime?: unknown
      featured?: unknown
      accent?: unknown
      status?: unknown
    }
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""
    const category = typeof body.category === "string" ? body.category : "社区"
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : content.slice(0, 180)
    const publishedAt = typeof body.publishedAt === "string" ? body.publishedAt : ""
    const readTime = typeof body.readTime === "string" ? body.readTime.trim() : "1 分钟"
    const accent = typeof body.accent === "string" ? body.accent : "blue"
    const status = typeof body.status === "string" ? body.status : "draft"

    if (!title || title.length > 255 || !content) {
      return errorResponse("请提供标题和正文，标题不能超过 255 个字符。", 400)
    }

    if (!categories.has(category) || !accents.has(accent) || !statuses.has(status)) {
      return errorResponse("新闻分类、色彩或状态无效。", 400)
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
      return errorResponse("发布时间格式无效。", 400)
    }

    const id = `news-${randomUUID()}`
    const serializedContent = JSON.stringify([content])

    await cmsDb.query<ResultSetHeader>(
      `INSERT INTO news_article
        (id, slug, category, title, excerpt, content, published_at,
         read_time, featured, accent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        makeSlug(title),
        category,
        title,
        excerpt,
        serializedContent,
        publishedAt,
        readTime,
        Boolean(body.featured),
        accent,
        status,
      ]
    )

    return NextResponse.json({ saved: true, id })
  } catch (error) {
    if (isCmsConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to create CMS news article", error)
    return errorResponse("保存新闻失败。", 500)
  }
}
