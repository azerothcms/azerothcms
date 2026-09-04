import { NextResponse } from "next/server"

import {
  createSessionToken,
  registerTrinityAccount,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string
      email?: string
      password?: string
    }
    const username = body.username?.trim() ?? ""
    const email = body.email?.trim() ?? ""
    const password = body.password ?? ""

    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      return NextResponse.json({ error: "用户名需为 3-16 位字母、数字或下划线。" }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return NextResponse.json({ error: "请输入有效的邮箱地址。" }, { status: 400 })
    }

    const passwordLength = Array.from(password).length

    if (passwordLength < 8 || passwordLength > 16) {
      return NextResponse.json({ error: "密码长度必须为 8-16 个字符，以兼容 TrinityCore。" }, { status: 400 })
    }

    const account = await registerTrinityAccount({ username, email, password })
    const response = NextResponse.json({
      session: {
        authenticated: true,
        accountId: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
      },
    })

    response.cookies.set(sessionCookieName(), createSessionToken(account), sessionCookieOptions())
    return response
  } catch (error) {
    if (
      (error instanceof Error && error.name === "ACCOUNT_ALREADY_EXISTS") ||
      (error as { code?: string }).code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json({ error: "用户名或邮箱已经存在。" }, { status: 409 })
    }

    console.error("Failed to register TrinityCore account", error)
    return NextResponse.json({ error: "注册失败，请检查数据库连接。" }, { status: 500 })
  }
}
