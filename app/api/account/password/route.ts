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
import {
  makeTrinityRegistrationData,
  verifyTrinityPassword,
} from "@/lib/trinity-srp6"

interface AccountRow extends RowDataPacket {
  id: number
  username: string
  email: string
  salt: Buffer
  verifier: Buffer
  locked: number
}

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
    return errorResponse("请先登录后再修改密码。", 401)
  }

  try {
    const body = (await request.json()) as {
      currentPassword?: unknown
      newPassword?: unknown
    }
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : ""
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : ""

    if (newPassword.length < 8 || newPassword.length > 16) {
      return errorResponse("新密码需为 8-16 个字符，以兼容 TrinityCore。", 400)
    }

    if (!currentPassword) {
      return errorResponse("请输入当前密码。", 400)
    }

    if (currentPassword === newPassword) {
      return errorResponse("新密码不能与当前密码相同。", 400)
    }

    const [accounts] = await authDb.execute<AccountRow[]>(
      `SELECT id, username, email, salt, verifier, locked
       FROM account
       WHERE id = ?
       LIMIT 1`,
      [session.accountId]
    )
    const account = accounts[0]

    if (!account || account.locked) {
      return errorResponse("当前账号不可用，请重新登录后重试。", 401)
    }

    if (!verifyTrinityPassword(account.username, currentPassword, account.salt, account.verifier)) {
      return errorResponse("当前密码不正确。", 400)
    }

    const { salt, verifier } = makeTrinityRegistrationData(account.username, newPassword)
    const [result] = await authDb.execute<ResultSetHeader>(
      "UPDATE account SET salt = ?, verifier = ? WHERE id = ?",
      [salt, verifier, account.id]
    )

    if (!result.affectedRows) {
      return errorResponse("密码更新失败，请稍后重试。", 500)
    }

    const cookieStore = await cookies()
    cookieStore.set(
      sessionCookieName(),
      createSessionToken({
        id: account.id,
        username: account.username,
        email: account.email,
        role: session.role ?? "player",
      }),
      sessionCookieOptions()
    )

    return NextResponse.json({ saved: true })
  } catch (error) {
    if (isAuthDatabaseError(error)) {
      return errorResponse("TrinityCore 认证库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to update TrinityCore account password", error)
    return errorResponse("修改密码失败。", 500)
  }
}
