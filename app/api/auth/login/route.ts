import { NextResponse } from "next/server"

import {
  authenticateTrinityAccount,
  createSessionToken,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string; password?: string }
    const identifier = body.identifier?.trim() ?? ""
    const password = body.password ?? ""

    if (!identifier || !password) {
      return NextResponse.json({ error: "请填写账号和密码。" }, { status: 400 })
    }

    const account = await authenticateTrinityAccount(identifier, password)

    if (!account) {
      return NextResponse.json({ error: "账号或密码不正确，或账号已被锁定。" }, { status: 401 })
    }

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
    console.error("Failed to authenticate TrinityCore account", error)
    return NextResponse.json({ error: "登录失败，请检查数据库连接。" }, { status: 500 })
  }
}
