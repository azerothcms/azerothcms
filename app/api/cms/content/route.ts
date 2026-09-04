import { NextResponse } from "next/server"
import type { RowDataPacket } from "mysql2"

import { getServerSession } from "@/lib/auth"
import { cmsDb } from "@/lib/db"

const CONTENT_KEYS = new Set([
  "realms",
  "news",
  "characters",
  "player_profile",
  "forum_categories",
  "forum_threads",
  "shop_products",
  "admin_overview",
  "admin_users",
  "news_draft",
])

interface ContentRow extends RowDataPacket {
  payload: unknown
  updated_at: Date | string
}

function isContentKey(value: unknown): value is string {
  return typeof value === "string" && CONTENT_KEYS.has(value)
}

function parsePayload(payload: unknown) {
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload) as unknown
    } catch {
      return undefined
    }
  }

  return payload
}

function isCmsConfigurationError(error: unknown) {
  const code = (error as { code?: string }).code
  return [
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
    "ER_ACCESS_DENIED_ERROR",
    "ER_DBACCESS_DENIED_ERROR",
    "ER_TABLEACCESS_DENIED_ERROR",
  ].includes(code ?? "")
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || session.role !== "admin") {
    return errorResponse("需要管理员权限。", session.authenticated ? 403 : 401)
  }

  const key = new URL(request.url).searchParams.get("key")

  if (!isContentKey(key)) {
    return errorResponse("无效的 CMS 内容键。", 400)
  }

  try {
    const [rows] = await cmsDb.execute<ContentRow[]>(
      "SELECT payload, updated_at FROM cms WHERE content_key = ? LIMIT 1",
      [key]
    )
    const row = rows[0]

    return NextResponse.json({
      key,
      payload: row ? parsePayload(row.payload) : null,
      updatedAt: row?.updated_at ?? null,
    })
  } catch (error) {
    if (isCmsConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error(`Failed to read CMS content: ${key}`, error)
    return errorResponse("读取 CMS 内容失败。", 500)
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || session.role !== "admin") {
    return errorResponse("需要管理员权限。", session.authenticated ? 403 : 401)
  }

  try {
    const body = (await request.json()) as { key?: unknown; payload?: unknown }

    if (!isContentKey(body.key) || body.payload === undefined) {
      return errorResponse("请提供有效的 CMS 内容键和 JSON 内容。", 400)
    }

    const serializedPayload = JSON.stringify(body.payload)

    await cmsDb.execute(
      `INSERT INTO cms (content_key, payload)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE payload = ?, updated_at = CURRENT_TIMESTAMP`,
      [body.key, serializedPayload, serializedPayload]
    )

    return NextResponse.json({ key: body.key, saved: true })
  } catch (error) {
    if (isCmsConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to write CMS content", error)
    return errorResponse("写入 CMS 内容失败。", 500)
  }
}
