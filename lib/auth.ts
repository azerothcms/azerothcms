import { createHmac, timingSafeEqual } from "node:crypto"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

import { authDb } from "@/lib/db"
import type { SessionState } from "@/lib/types"
import {
  makeTrinityRegistrationData,
  normalizeTrinityCredential,
  verifyTrinityPassword,
} from "@/lib/trinity-srp6"

const SESSION_COOKIE = "azerothcms-auth"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

interface AccountRow extends RowDataPacket {
  id: number
  username: string
  email: string
  salt: Buffer
  verifier: Buffer
  locked: number
  securityLevel: number
}

export interface AuthenticatedAccount {
  id: number
  username: string
  email: string
  role: "admin" | "player"
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET must be configured in production")
  }

  return secret ?? "azerothcms-local-development-secret"
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url")
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url")
}

export function createSessionToken(account: AuthenticatedAccount) {
  const payload = encodeBase64Url(
    JSON.stringify({
      sub: account.id,
      username: account.username,
      email: account.email,
      role: account.role,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    })
  )
  return `${payload}.${sign(payload)}`
}

export function parseSessionToken(token: string | undefined): SessionState | null {
  if (!token) {
    return null
  }

  const [payload, signature] = token.split(".")

  if (!payload || !signature) {
    return null
  }

  const expectedSignature = sign(payload)
  const actual = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null
  }

  try {
    const data = JSON.parse(decodeBase64Url(payload)) as {
      sub?: number
      username?: string
      email?: string
      role?: "admin" | "player"
      exp?: number
    }

    if (
      !data.sub ||
      !data.username ||
      !data.email ||
      !data.role ||
      !data.exp ||
      data.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null
    }

    return {
      authenticated: true,
      accountId: data.sub,
      username: data.username,
      email: data.email,
      role: data.role,
    }
  } catch {
    return null
  }
}

export async function getServerSession(): Promise<SessionState> {
  const cookieStore = await cookies()
  return parseSessionToken(cookieStore.get(SESSION_COOKIE)?.value) ?? { authenticated: false }
}

export async function requireSession() {
  const session = await getServerSession()

  if (!session.authenticated) {
    redirect("/login")
  }

  return session
}

export async function requireAdminSession() {
  const session = await requireSession()

  if (session.role !== "admin") {
    redirect("/account")
  }

  return session
}

async function findAccount(identifier: string): Promise<AccountRow | undefined> {
  const [rows] = await authDb.execute<AccountRow[]>(
    `SELECT
       a.id,
       a.username,
       a.email,
       a.salt,
       a.verifier,
       a.locked,
       COALESCE(MAX(aa.SecurityLevel), 0) AS securityLevel
     FROM account a
     LEFT JOIN account_access aa ON aa.AccountID = a.id
     WHERE a.username = ? OR a.email = ?
     GROUP BY a.id, a.username, a.email, a.salt, a.verifier, a.locked
     LIMIT 1`,
    [identifier.toUpperCase(), identifier.trim()]
  )

  return rows[0]
}

export async function authenticateTrinityAccount(
  identifier: string,
  password: string
): Promise<AuthenticatedAccount | null> {
  const account = await findAccount(identifier.trim())

  if (!account || account.locked || !verifyTrinityPassword(account.username, password, account.salt, account.verifier)) {
    return null
  }

  await authDb.execute("UPDATE account SET last_login = NOW() WHERE id = ?", [account.id])

  return {
    id: account.id,
    username: account.username,
    email: account.email,
    role: account.securityLevel >= 3 ? "admin" : "player",
  }
}

export async function registerTrinityAccount(input: {
  username: string
  email: string
  password: string
}): Promise<AuthenticatedAccount> {
  return createTrinityAccount(input, "player")
}

export async function registerTrinityAdminAccount(input: {
  username: string
  email: string
  password: string
}): Promise<AuthenticatedAccount> {
  return createTrinityAccount(input, "admin")
}

async function createTrinityAccount(
  input: {
    username: string
    email: string
    password: string
  },
  role: "admin" | "player"
): Promise<AuthenticatedAccount> {
  const username = normalizeTrinityCredential(input.username.trim())
  const email = normalizeTrinityCredential(input.email.trim())
  const connection = await authDb.getConnection()

  try {
    await connection.beginTransaction()

    if (role === "admin") {
      const [admins] = await connection.execute<RowDataPacket[]>(
        "SELECT COUNT(*) AS count FROM account_access WHERE SecurityLevel >= 3"
      )

      if (Number(admins[0]?.count ?? 0) > 0) {
        const error = new Error("SETUP_ALREADY_COMPLETED")
        error.name = "SETUP_ALREADY_COMPLETED"
        throw error
      }
    }

    const [existing] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM account WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    )

    if (existing.length) {
      const error = new Error("ACCOUNT_ALREADY_EXISTS")
      error.name = "ACCOUNT_ALREADY_EXISTS"
      throw error
    }

    const { salt, verifier } = makeTrinityRegistrationData(username, input.password)
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO account
        (username, salt, verifier, reg_mail, email, joindate)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [username, salt, verifier, email, email]
    )

    await connection.execute(
      `INSERT INTO realmcharacters (realmid, acctid, numchars)
       SELECT id, ?, 0 FROM realmlist`,
      [result.insertId]
    )

    if (role === "admin") {
      await connection.execute(
        `INSERT INTO account_access (AccountID, SecurityLevel, RealmID, Comment)
         VALUES (?, 3, -1, ?)`,
        [result.insertId, "AzerothCMS initial administrator"]
      )
    }

    await connection.commit()

    return {
      id: result.insertId,
      username,
      email,
      role,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export function sessionCookieName() {
  return SESSION_COOKIE
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  }
}
