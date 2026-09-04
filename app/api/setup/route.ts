import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  createSessionToken,
  registerTrinityAdminAccount,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth"
import { getSetupStatus } from "@/lib/setup"

export const dynamic = "force-dynamic"

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

export async function POST(request: Request) {
  const status = await getSetupStatus()

  if (status.auth.state !== "ready") {
    return errorResponse(status.auth.message, 503)
  }

  if (status.auth.admins > 0) {
    return errorResponse("初始化已完成，请使用管理员账号登录。", 409)
  }

  try {
    const body = (await request.json()) as {
      username?: unknown
      email?: unknown
      password?: unknown
    }
    const username = typeof body.username === "string" ? body.username.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      return errorResponse("管理员账号需为 3-16 位字母、数字或下划线。", 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("请输入有效的管理员邮箱。", 400)
    }

    const passwordLength = Array.from(password).length

    if (passwordLength < 8 || passwordLength > 16) {
      return errorResponse("管理员密码需为 8-16 个字符。", 400)
    }

    const account = await registerTrinityAdminAccount({ username, email, password })
    const cookieStore = await cookies()
    cookieStore.set(
      sessionCookieName(),
      createSessionToken(account),
      sessionCookieOptions()
    )

    return NextResponse.json({
      setupCompleted: true,
      cmsReady: status.cms.state === "ready",
      session: {
        authenticated: true,
        accountId: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ACCOUNT_ALREADY_EXISTS") {
      return errorResponse("该账号或邮箱已经存在。", 409)
    }

    if (error instanceof Error && error.name === "SETUP_ALREADY_COMPLETED") {
      return errorResponse("初始化已完成，请使用管理员账号登录。", 409)
    }

    if (isDatabaseConfigurationError(error)) {
      return errorResponse("TrinityCore 认证库尚未完成初始化。", 503)
    }

    console.error("Failed to initialize AzerothCMS administrator", error)
    return errorResponse("创建管理员失败，请检查 TrinityCore 数据库结构。", 500)
  }
}
