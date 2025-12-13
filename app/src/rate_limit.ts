import { db } from './db_init.ts'
import { RateLimitDb } from './types.ts'

export class RateLimitError extends Error {}

type RateLimit = RateLimitDb

export async function rateLimit(
  userId: string,
  endpoint: string,
  limit: number,
  windowSeconds: number
) {
  const key = `${userId}:${endpoint}`
  const now = Date.now()
  const resetAt = new Date(now + windowSeconds * 1000).toISOString()

  const row = await db.prepare<string, RateLimit>(
    `SELECT count, reset_at FROM rate_limits WHERE key = ?`,
  ).get(key)

  if (!row) {
    await db.prepare(
      `INSERT INTO rate_limits (key, count, reset_at)
       VALUES (?, 1, ?)`,
    ).run([key, resetAt])
    return
  }

  if (new Date(row.reset_at).getTime() < now) {
    await db.prepare(
      `UPDATE rate_limits
       SET count = 1, reset_at = ?
       WHERE key = ?`,
    ).run([resetAt, key])
    return
  }

  if (row.count >= limit) {
    throw new RateLimitError()
  }

  await db.prepare(
    `UPDATE rate_limits
     SET count = count + 1
     WHERE key = ?`,
  ).run(key)
}