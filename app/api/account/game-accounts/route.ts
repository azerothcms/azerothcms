import { NextResponse } from "next/server"

import { createTrinityGameAccount, getServerSession } from "@/lib/auth"

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

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session.authenticated || !session.accountId) {
    return errorResponse("请先登录后再创建游戏账号。", 401)
  }

  try {
    const body = (await request.json()) as {
      username?: unknown
      password?: unknown
    }
    const username = typeof body.username === "string" ? body.username.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      return errorResponse("游戏账号需为 3-16 位字母、数字或下划线。", 400)
    }

    const passwordLength = Array.from(password).length

    if (passwordLength < 8 || passwordLength > 16) {
      return errorResponse("密码长度必须为 8-16 个字符，以兼容 TrinityCore。", 400)
    }

    const account = await createTrinityGameAccount({
      ownerAccountId: session.accountId,
      username,
      password,
    })

    return NextResponse.json({
      gameAccount: {
        id: `account-${account.id}`,
        username: account.username,
        expansion: process.env.TRINITY_EXPANSION ?? "TrinityCore",
        status: "active",
        characterCount: 0,
        lastLogin: "从未登录",
      },
    })
  } catch (error) {
    if (
      (error instanceof Error && error.name === "ACCOUNT_ALREADY_EXISTS") ||
      (error as { code?: string }).code === "ER_DUP_ENTRY"
    ) {
      return errorResponse("该游戏账号名称已经存在。", 409)
    }

    if (isDatabaseConfigurationError(error)) {
      return errorResponse("CMS 数据库尚未初始化，无法建立游戏账号归属关系。", 503)
    }

    console.error("Failed to create linked TrinityCore game account", error)
    return errorResponse("创建游戏账号失败，请稍后重试。", 500)
  }
}
