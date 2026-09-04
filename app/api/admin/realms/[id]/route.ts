import { NextResponse } from "next/server"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

import { getServerSession } from "@/lib/auth"
import { authDb, cmsDb } from "@/lib/db"
import type { RealmStatus } from "@/lib/types"

interface RealmRow extends RowDataPacket {
  id: number
}

interface RealmRouteProps {
  params: Promise<{ id: string }>
}

const realmStatuses = new Set<RealmStatus>(["online", "offline", "maintenance"])

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function isConfigurationError(error: unknown) {
  const code = (error as { code?: string }).code
  return [
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
    "ER_ACCESS_DENIED_ERROR",
    "ER_DBACCESS_DENIED_ERROR",
    "ER_TABLEACCESS_DENIED_ERROR",
  ].includes(code ?? "")
}

export async function PATCH(request: Request, { params }: RealmRouteProps) {
  const session = await getServerSession()

  if (!session.authenticated || session.role !== "admin") {
    return errorResponse("需要管理员权限。", session.authenticated ? 403 : 401)
  }

  const { id } = await params
  const match = /^realm-(\d+)$/.exec(id)

  if (!match) {
    return errorResponse("无效的 Realm ID。", 400)
  }

  const realmId = Number(match[1])

  try {
    const [realms] = await authDb.execute<RealmRow[]>(
      "SELECT id FROM realmlist WHERE id = ? LIMIT 1",
      [realmId]
    )

    if (!realms[0]) {
      return errorResponse("Realm 不存在。", 404)
    }

    const body = (await request.json()) as { status?: unknown; description?: unknown }

    if (typeof body.status !== "string" || !realmStatuses.has(body.status as RealmStatus)) {
      return errorResponse("无效的 Realm 状态。", 400)
    }

    const description = typeof body.description === "string" ? body.description.slice(0, 1000) : null

    await cmsDb.query<ResultSetHeader>(
      `INSERT INTO realm_override (realm_id, status, description, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = ?, description = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP`,
      [realmId, body.status, description, session.accountId, body.status, description, session.accountId]
    )

    return NextResponse.json({ id, status: body.status, saved: true })
  } catch (error) {
    if (isConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error(`Failed to update Realm override: ${id}`, error)
    return errorResponse("保存 Realm 状态失败。", 500)
  }
}
