import mysql, { type Pool } from "mysql2/promise"

const connectionConfig = {
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER ?? "trinity",
  password: process.env.MYSQL_PASSWORD ?? "trinity",
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? "10"),
  queueLimit: 0,
  enableKeepAlive: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
}

function createDatabasePool(database: string): Pool {
  return mysql.createPool({
    ...connectionConfig,
    database,
    charset: "utf8mb4",
    timezone: "Z",
  })
}

export const authDb = createDatabasePool(process.env.TRINITY_AUTH_DATABASE ?? "auth")
export const worldDb = createDatabasePool(process.env.TRINITY_WORLD_DATABASE ?? "world")
export const charactersDb = createDatabasePool(
  process.env.TRINITY_CHARACTERS_DATABASE ?? "characters"
)
export const cmsDb = createDatabasePool(process.env.CMS_DATABASE ?? "cms")
