import fs from 'node:fs'
import path from 'node:path'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import type { Database } from './schema'

let dbInstance: Kysely<Database> | null = null

function loadEnvIfNeeded(): void {
  if (process.env.DATABASE_URL) return

  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath)
    return
  }

  const content = fs.readFileSync(envPath, 'utf-8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2')
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

function resolveDatabaseUrl(): string {
  loadEnvIfNeeded()

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not configured. Define it in your environment or .env file to run Playwright database helpers.'
    )
  }

  return connectionString
}

function shouldUseSsl(connectionString: string): boolean {
  if (connectionString.includes('sslmode=disable')) return false

  try {
    const { hostname } = new URL(connectionString)
    return hostname !== 'localhost' && hostname !== '127.0.0.1'
  } catch {
    return true
  }
}

/**
 * Returns a shared Kysely instance configured for PostgreSQL.
 */
export function getDatabase(): Kysely<Database> {
  if (dbInstance) return dbInstance

  const connectionString = resolveDatabaseUrl()
  const pool = new Pool({
    connectionString,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  })

  dbInstance = new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  })

  return dbInstance
}

/**
 * Destroys the shared Kysely instance and closes the underlying pg pool.
 */
export async function closeDatabase(): Promise<void> {
  if (!dbInstance) return

  const instance = dbInstance
  dbInstance = null
  await instance.destroy()
}
