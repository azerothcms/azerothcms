import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/auth"
import { cmsDb } from "@/lib/db"

interface ProductRow extends RowDataPacket {
  id: string
  price: number | string
  currency: string
}

interface OrderRow extends RowDataPacket {
  id: number | string
  status: "pending" | "paid" | "cancelled" | "fulfilled"
  total: number | string
  currency: string
  created_at: Date | string
  items: string | null
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

export async function GET() {
  const session = await getServerSession()

  if (!session.authenticated || !session.accountId) {
    return errorResponse("请先登录后查看订单。", 401)
  }

  try {
    const [orders] = await cmsDb.execute<OrderRow[]>(
      `SELECT o.id, o.status, o.total, o.currency, o.created_at,
              GROUP_CONCAT(
                CONCAT(COALESCE(p.name, i.product_id), ' × ', i.quantity)
                ORDER BY i.id SEPARATOR '、'
              ) AS items
       FROM shop_order o
       INNER JOIN shop_order_item i ON i.order_id = o.id
       LEFT JOIN shop_product p ON p.id = i.product_id
       WHERE o.account_id = ?
       GROUP BY o.id, o.status, o.total, o.currency, o.created_at
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [session.accountId]
    )

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: String(order.id),
        status: order.status,
        total: Number(order.total),
        currency: order.currency,
        createdAt: String(order.created_at),
        items: order.items ?? "订单明细不可用",
      })),
    })
  } catch (error) {
    if (isCmsConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化或当前账号没有访问权限。", 503)
    }

    console.error("Failed to read CMS shop orders", error)
    return errorResponse("读取订单失败。", 500)
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || !session.accountId) {
    return errorResponse("请先登录后再提交订单。", 401)
  }

  try {
    const body = (await request.json()) as {
      items?: unknown
    }
    const items = Array.isArray(body.items)
      ? body.items.filter(
          (item): item is { productId: string; quantity: number } =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof (item as { productId?: unknown }).productId === "string" &&
            Number.isInteger((item as { quantity?: unknown }).quantity) &&
            Number((item as { quantity: number }).quantity) > 0 &&
            Number((item as { quantity: number }).quantity) <= 65535
        )
      : []

    if (!items.length || items.length > 50) {
      return errorResponse("订单商品不能为空，且最多包含 50 种商品。", 400)
    }

    const quantities = new Map<string, number>()
    for (const item of items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
    }

    const productIds = [...quantities.keys()]
    const placeholders = productIds.map(() => "?").join(",")
    const [products] = await cmsDb.execute<ProductRow[]>(
      `SELECT id, price, currency
       FROM shop_product
       WHERE active = TRUE AND id IN (${placeholders})`,
      productIds
    )

    if (products.length !== productIds.length) {
      return errorResponse("订单中包含不存在或已下架的商品。", 400)
    }

    const currency = products[0]?.currency ?? "点券"
    if (products.some((product) => product.currency !== currency)) {
      return errorResponse("订单中的商品必须使用同一种货币。", 400)
    }

    const total = products.reduce(
      (sum, product) => sum + Number(product.price) * (quantities.get(product.id) ?? 0),
      0
    )
    const connection = await cmsDb.getConnection()

    try {
      await connection.beginTransaction()
      const [order] = await connection.execute<ResultSetHeader>(
        `INSERT INTO shop_order (account_id, status, total, currency)
         VALUES (?, 'pending', ?, ?)`,
        [session.accountId, total, currency]
      )

      for (const product of products) {
        const quantity = quantities.get(product.id) ?? 0
        await connection.execute(
          `INSERT INTO shop_order_item (order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [order.insertId, product.id, quantity, product.price]
        )
      }

      await connection.commit()
      return NextResponse.json({ saved: true, orderId: String(order.insertId), total, currency })
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

    console.error("Failed to create CMS shop order", error)
    return errorResponse("提交订单失败。", 500)
  }
}
