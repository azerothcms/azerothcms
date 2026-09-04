import { randomUUID } from "node:crypto"

import type { RowDataPacket } from "mysql2"
import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/auth"
import { cmsDb } from "@/lib/db"

interface CategoryRow extends RowDataPacket {
  id: string
}

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

  return `${base || "discussion"}-${Date.now()}`
}

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || !session.accountId) {
    return errorResponse("请先登录后再发布主题。", 401)
  }

  try {
    const body = (await request.json()) as {
      title?: unknown
      content?: unknown
      categorySlug?: unknown
    }
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""
    const categorySlug = typeof body.categorySlug === "string" ? body.categorySlug.trim() : "general"

    if (!title || title.length > 255 || !content) {
      return errorResponse("请提供主题标题和内容，标题不能超过 255 个字符。", 400)
    }

    const [categories] = await cmsDb.execute<CategoryRow[]>(
      "SELECT id FROM forum_category WHERE slug = ? LIMIT 1",
      [categorySlug]
    )

    if (!categories[0]) {
      return errorResponse("指定的论坛分类不存在。", 404)
    }

    const id = `thread-${randomUUID()}`
    const excerpt = content.slice(0, 180)

    await cmsDb.execute(
      `INSERT INTO forum_thread
        (id, slug, category_id, author_account_id, title, excerpt, body, tags,
         is_pinned, is_hot, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE, 0)`,
      [
        id,
        makeSlug(title),
        categories[0].id,
        session.accountId,
        title,
        excerpt,
        JSON.stringify([content]),
        JSON.stringify([]),
      ]
    )

    return NextResponse.json({ saved: true, id })
  } catch (error) {
    if (isCmsConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to create CMS forum thread", error)
    return errorResponse("发布主题失败。", 500)
  }
}
