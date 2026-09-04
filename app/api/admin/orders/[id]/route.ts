import type { ResultSetHeader } from "mysql2"
import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/auth"
import { cmsDb } from "@/lib/db"

const statuses = new Set(["pending", "paid", "cancelled", "fulfilled"])

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()

  if (!session.authenticated || session.role !== "admin") {
    return errorResponse("需要管理员权限。", session.authenticated ? 403 : 401)
  }

  const { id } = await params
  const orderId = Number(id)

  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return errorResponse("订单号无效。", 400)
  }

  try {
    const body = (await request.json()) as { status?: unknown }

    if (typeof body.status !== "string" || !statuses.has(body.status)) {
      return errorResponse("订单状态无效。", 400)
    }

    const [result] = await cmsDb.query<ResultSetHeader>(
      "UPDATE shop_order SET status = ? WHERE id = ?",
      [body.status, orderId]
    )

    if (!result.affectedRows) {
      return errorResponse("订单不存在。", 404)
    }

    return NextResponse.json({ saved: true, id: String(orderId), status: body.status })
  } catch (error) {
    if (isCmsConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to update CMS order status", error)
    return errorResponse("更新订单状态失败。", 500)
  }
}
