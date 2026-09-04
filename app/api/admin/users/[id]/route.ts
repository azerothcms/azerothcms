import { NextResponse } from "next/server"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

import { getServerSession } from "@/lib/auth"
import { authDb } from "@/lib/db"

interface AccountRow extends RowDataPacket {
  id: number
  securityLevel: number
}

interface UserRouteProps {
  params: Promise<{ id: string }>
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function PATCH(request: Request, { params }: UserRouteProps) {
  const session = await getServerSession()

  if (!session.authenticated || session.role !== "admin") {
    return errorResponse("需要管理员权限。", session.authenticated ? 403 : 401)
  }

  const { id } = await params
  const match = /^user-(\d+)$/.exec(id)

  if (!match) {
    return errorResponse("无效的用户 ID。", 400)
  }

  const accountId = Number(match[1])

  if (accountId === session.accountId) {
    return errorResponse("不能暂停当前登录的管理员账号。", 400)
  }

  try {
    const [accounts] = await authDb.execute<AccountRow[]>(
      `SELECT a.id, COALESCE(MAX(aa.SecurityLevel), 0) AS securityLevel
       FROM account a
       LEFT JOIN account_access aa ON aa.AccountID = a.id
       WHERE a.id = ?
       GROUP BY a.id`,
      [accountId]
    )
    const account = accounts[0]

    if (!account) {
      return errorResponse("用户不存在。", 404)
    }

    if (account.securityLevel >= 3) {
      return errorResponse("不能通过玩家管理操作其他管理员账号。", 403)
    }

    const body = (await request.json()) as { locked?: unknown }

    if (typeof body.locked !== "boolean") {
      return errorResponse("locked 必须是布尔值。", 400)
    }

    const [result] = await authDb.execute<ResultSetHeader>(
      "UPDATE account SET locked = ? WHERE id = ?",
      [body.locked ? 1 : 0, accountId]
    )

    return NextResponse.json({ id, locked: Boolean(body.locked), updated: result.affectedRows > 0 })
  } catch (error) {
    console.error(`Failed to update account lock status: ${id}`, error)
    return errorResponse("保存玩家状态失败。", 500)
  }
}
