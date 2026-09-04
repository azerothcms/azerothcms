import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

import {
  createSessionToken,
  getServerSession,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth"
import { authDb } from "@/lib/db"

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function isAuthDatabaseError(error: unknown) {
  return [
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
    "ER_ACCESS_DENIED_ERROR",
    "ER_DBACCESS_DENIED_ERROR",
    "ER_TABLEACCESS_DENIED_ERROR",
  ].includes((error as { code?: string }).code ?? "")
}

export const dynamic = "force-dynamic"

export async function PATCH(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || !session.accountId) {
    return errorResponse("请先登录后再更新账号资料。", 401)
  }

  try {
    const body = (await request.json()) as { email?: unknown }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("请输入有效的邮箱地址。", 400)
    }

    const [existing] = await authDb.execute<RowDataPacket[]>(
      "SELECT id FROM account WHERE email = ? AND id <> ? LIMIT 1",
      [email, session.accountId]
    )

    if (existing.length) {
      return errorResponse("该邮箱已被其他账号使用。", 409)
    }

    const [result] = await authDb.query<ResultSetHeader>(
      "UPDATE account SET email = ? WHERE id = ?",
      [email, session.accountId]
    )

    if (!result.affectedRows) {
      return errorResponse("账号不存在。", 404)
    }

    const updatedAccount = {
      id: session.accountId,
      username: session.username ?? "",
      email,
      role: session.role ?? "player",
    } as const
    const updatedSession = {
      authenticated: true,
      accountId: updatedAccount.id,
      username: updatedAccount.username,
      email: updatedAccount.email,
      role: updatedAccount.role,
    }
    const cookieStore = await cookies()
    cookieStore.set(
      sessionCookieName(),
      createSessionToken(updatedAccount),
      sessionCookieOptions()
    )

    return NextResponse.json({ saved: true, session: updatedSession })
  } catch (error) {
    if (isAuthDatabaseError(error)) {
      return errorResponse("TrinityCore 认证库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to update TrinityCore account profile", error)
    return errorResponse("更新账号资料失败。", 500)
  }
}
