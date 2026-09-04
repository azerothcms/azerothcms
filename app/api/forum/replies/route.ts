import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/auth"
import { cmsDb } from "@/lib/db"

interface ThreadRow extends RowDataPacket {
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

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || !session.accountId) {
    return errorResponse("请先登录后再发布回复。", 401)
  }

  try {
    const body = (await request.json()) as {
      threadSlug?: unknown
      content?: unknown
    }
    const threadSlug = typeof body.threadSlug === "string" ? body.threadSlug.trim() : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""

    if (!threadSlug || !content || content.length > 5000) {
      return errorResponse("请输入回复内容，且不能超过 5000 个字符。", 400)
    }

    const [threads] = await cmsDb.execute<ThreadRow[]>(
      "SELECT id FROM forum_thread WHERE slug = ? LIMIT 1",
      [threadSlug]
    )

    if (!threads[0]) {
      return errorResponse("主题不存在。", 404)
    }

    const connection = await cmsDb.getConnection()

    try {
      await connection.beginTransaction()
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO forum_reply (thread_id, author_account_id, body)
         VALUES (?, ?, ?)`,
        [threads[0].id, session.accountId, content]
      )
      await connection.execute(
        "UPDATE forum_thread SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [threads[0].id]
      )
      await connection.commit()

      return NextResponse.json({
        saved: true,
        reply: {
          id: String(result.insertId),
          author: session.username,
          content,
          createdAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    if (isCmsConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to create CMS forum reply", error)
    return errorResponse("发布回复失败。", 500)
  }
}
