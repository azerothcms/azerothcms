import type { RowDataPacket } from "mysql2"

import { authDb, cmsDb } from "@/lib/db"
import type { SetupStatus } from "@/lib/types"

interface CountRow extends RowDataPacket {
  count: number | string
}

const CONFIGURATION_ERRORS = new Set([
  "ER_BAD_DB_ERROR",
  "ER_NO_SUCH_TABLE",
  "ER_ACCESS_DENIED_ERROR",
  "ER_DBACCESS_DENIED_ERROR",
  "ER_TABLEACCESS_DENIED_ERROR",
])

function errorCode(error: unknown) {
  return (error as { code?: string }).code
}

function databaseErrorMessage(error: unknown, database: string) {
  const code = errorCode(error)

  if (code === "ER_BAD_DB_ERROR") {
    return `数据库 ${database} 尚未创建。`
  }

  if (code === "ER_NO_SUCH_TABLE") {
    return `数据库 ${database} 缺少必要表。`
  }

  if (CONFIGURATION_ERRORS.has(code ?? "")) {
    return `数据库 ${database} 连接账号没有足够权限。`
  }

  return `无法连接数据库 ${database}。`
}

async function inspectAuthDatabase(): Promise<SetupStatus["auth"]> {
  const database = process.env.TRINITY_AUTH_DATABASE ?? "auth"

  try {
    const [[accounts], [admins], [realms]] = await Promise.all([
      authDb.execute<CountRow[]>("SELECT COUNT(*) AS count FROM account"),
      authDb.execute<CountRow[]>(
        "SELECT COUNT(*) AS count FROM account_access WHERE SecurityLevel >= 3"
      ),
      authDb.execute<CountRow[]>("SELECT COUNT(*) AS count FROM realmlist"),
    ])

    return {
      state: "ready",
      database,
      accounts: Number(accounts[0]?.count ?? 0),
      admins: Number(admins[0]?.count ?? 0),
      realms: Number(realms[0]?.count ?? 0),
      message: "TrinityCore 认证库已连接。",
    }
  } catch (error) {
    if (!CONFIGURATION_ERRORS.has(errorCode(error) ?? "")) {
      console.error("Failed to inspect TrinityCore auth database", error)
    }

    return {
      state: CONFIGURATION_ERRORS.has(errorCode(error) ?? "") ? "missing" : "error",
      database,
      accounts: 0,
      admins: 0,
      realms: 0,
      message: databaseErrorMessage(error, database),
    }
  }
}

async function inspectCmsDatabase(): Promise<SetupStatus["cms"]> {
  const database = process.env.CMS_DATABASE ?? "cms"

  try {
    await cmsDb.execute("SELECT content_key FROM cms LIMIT 1")

    return {
      state: "ready",
      database,
      message: "CMS 数据库与内容表已就绪。",
    }
  } catch (error) {
    if (!CONFIGURATION_ERRORS.has(errorCode(error) ?? "")) {
      console.error("Failed to inspect CMS database", error)
    }

    return {
      state: CONFIGURATION_ERRORS.has(errorCode(error) ?? "") ? "missing" : "error",
      database,
      message: databaseErrorMessage(error, database),
    }
  }
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const [auth, cms] = await Promise.all([
    inspectAuthDatabase(),
    inspectCmsDatabase(),
  ])

  return {
    setupRequired: auth.state !== "ready" || auth.admins === 0,
    auth,
    cms,
  }
}
