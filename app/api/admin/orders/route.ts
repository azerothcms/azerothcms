import type { RowDataPacket } from "mysql2"
import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/auth"
import { authDb, cmsDb } from "@/lib/db"

interface OrderRow extends RowDataPacket {
  id: number | string
  account_id: number
  status: "pending" | "paid" | "cancelled" | "fulfilled"
  total: number | string
  currency: string
  created_at: Date | string
  items: string | null
}

interface AccountRow extends RowDataPacket {
  id: number
  username: string
  email: string
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function isDatabaseConfigurationError(error: unknown) {
  return [
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
    "ER_ACCESS_DENIED_ERROR",
    "ER_DBACCESS_DENIED_ERROR",
    "ER_TABLEACCESS_DENIED_ERROR",
  ].includes((error as { code?: string }).code ?? "")
}

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession()

  if (!session.authenticated || session.role !== "admin") {
    return errorResponse("需要管理员权限。", session.authenticated ? 403 : 401)
  }

  try {
    const [rows] = await cmsDb.execute<OrderRow[]>(
      `SELECT o.id, o.account_id, o.status, o.total, o.currency, o.created_at,
              GROUP_CONCAT(
                CONCAT(COALESCE(p.name, i.product_id), ' × ', i.quantity)
                ORDER BY i.id SEPARATOR '、'
              ) AS items
       FROM shop_order o
       INNER JOIN shop_order_item i ON i.order_id = o.id
       LEFT JOIN shop_product p ON p.id = i.product_id
       GROUP BY o.id, o.account_id, o.status, o.total, o.currency, o.created_at
       ORDER BY o.created_at DESC
       LIMIT 100`
    )

    if (!rows.length) {
      return NextResponse.json({ orders: [] })
    }

    const accountIds = [...new Set(rows.map((order) => order.account_id))]
    const placeholders = accountIds.map(() => "?").join(",")
    const [accounts] = await authDb.execute<AccountRow[]>(
      `SELECT id, username, email FROM account WHERE id IN (${placeholders})`,
      accountIds
    )
    const accountMap = new Map(accounts.map((account) => [account.id, account]))

    return NextResponse.json({
      orders: rows.map((order) => {
        const account = accountMap.get(order.account_id)

        return {
          id: String(order.id),
          accountId: order.account_id,
          username: account?.username ?? `账号 ${order.account_id}`,
          email: account?.email ?? "",
          status: order.status,
          total: Number(order.total),
          currency: order.currency,
          createdAt: String(order.created_at),
          items: order.items ?? "订单明细不可用",
        }
      }),
    })
  } catch (error) {
    if (isDatabaseConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to read CMS admin orders", error)
    return errorResponse("读取订单失败。", 500)
  }
}
