import { Router } from "express";
import { db } from "./db_init.ts";

declare global {
  namespace Express {
    interface Request {
      user_id?: string;
    }
  }
}

class LockedDayError extends Error {}
class InvalidHashError extends Error {}



export const router = Router()

router.use(async (req, res, next) => {
  let sessionId = req.cookies.morchess_session
  let userId: string | undefined

  if (sessionId) {
    const row = await db.prepare<string, { user_id: string }>(
      `SELECT user_id FROM sessions WHERE session_id = ?`,
    ).get(sessionId)

    if (row) {
      userId = row.user_id
      await db.prepare(
        `UPDATE sessions
         SET last_seen_at = datetime('now')
         WHERE session_id = ?`,
      ).get(sessionId)

    } else {
      // Stale or invalid cookie
      res.clearCookie('morchess_session')
      sessionId = undefined
    }
  }

  // Create new session if needed
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    userId = crypto.randomUUID()

    await db.prepare(
      `INSERT INTO users (user_id, created_at)
       VALUES (?, datetime('now'))`,
    ).run(userId)

    await db.prepare(
      `INSERT INTO sessions
       (session_id, user_id, created_at, last_seen_at)
       VALUES (?, ?, datetime('now'), datetime('now'))`,
    ).run([sessionId, userId])

    res.cookie('morchess_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
  }

  // Invariant satisfied
  req.user_id = userId!
  next()
})

router.post('/handle', async (req, res) => {
    const { handle } = req.body

    if (!handle || handle.length > 24) {
        return res.status(400).json({ error: 'Invalid handle' })
    }

    try {
        await db.prepare(
            `INSERT OR IGNORE INTO users (handle, created_at) WHERE users.id = ? VALUES (?, ?)`
        ).run(
            req.user_id,
            handle,
            Date.now()
        )
        res.json({ ok: true })
    } catch {
        res.status(500).json({ error: 'Failed to set handle' })
    }
})


router.post('/score', async (req, res) => {


    await rateLimit(req.user_id!, 'score_fast', 1, 10)
    await rateLimit(req.user_id!, 'score_hour', 3, 3600)

    const { score, difficulty, hash } = req.body
    const today = new Date().toISOString().slice(0, 10)


    if (!verifyHash(score, difficulty, hash)) {
        return res.status(400).json({ error: 'Invalid submission' })
    }

    if (!['a', 'b', 'c'].includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty' })
    }

    if (!Number.isInteger(score) || score < 0 || score > 10_000) {
        return res.status(400).json({ error: 'Invalid score' })
    }

    const user = await db.prepare<{}, { id: string}>(`SELECT id FROM users ORDER BY id DESC LIMIT 1`).get({})
    if (!user) {
        return res.status(400).json({ error: 'Handle not set' })
    }


    try {


        const row = await db.prepare<[string, string, string], { score: number }>(`
            SELECT score FROM daily_scores
            WHERE user_id = ? AND date_utc = ? AND difficulty = ?
        `).get(user.id, today, difficulty)

        if (row) {
            return res.json({ ok: true, score: row.score })
        }

        await db.prepare(
            `INSERT INTO daily_scores 
             (user_id, date_utc, difficulty, score, created_at)
             VALUES (?, ?, ?, ?, ?)`,
        ).run(
            user.id,
            today,
            difficulty,
            score,
            Date.now()
        )

        const todayUTC = today
        const yearWeek = today

        invalidateCache(`daily:${todayUTC}`)
        invalidateCache(`weekly:${yearWeek}`)


        res.json({ ok: true })
    } catch {
        res.status(409).json({ error: 'Already submitted' })
    }
})

router.get('/daily', async (_, res) => {
    const date = new Date().toISOString().slice(0, 10)

    const cacheKey = `daily:${date}`

    const cached = getCache<DifficultyLeaderboard>(cacheKey)

    if (cached) {
        return res.send(cached)
    }

    const leaderboard = await computeDailyLeaderboard(date)

    setCache(cacheKey, leaderboard, 60_000)
    res.send(leaderboard)
})


async function computeDailyLeaderboard(date: string) {

    const rows = await db.prepare<string, { handle: string, score: number, created_at: number, difficulty: string }>(`
        SELECT u.handle, d.score, d.created_at, d.difficulty
        FROM daily_scores d
        JOIN users u ON u.id = d.user_id
        WHERE d.date_utc = ?
        ORDER BY d.score ASC
        LIMIT 100
    `).all(date)

    return {
        a: rows.filter(r => r.difficulty === 'a'),
        b: rows.filter(r => r.difficulty === 'b'),
        c: rows.filter(r => r.difficulty === 'c')
    }
}

router.get('/weekly', async (_, res) => {
    const rows = await db.prepare<{}, { handle: string, difficulty: string, score: number, created_at: number }>(`
        SELECT u.handle, d.difficulty,
        AVG(d.score) as score,
        MIN(d.created_at) as created_at
        FROM daily_scores d
        JOIN users u ON u.id = d.user_id
        WHERE d.date_utc >= date('now', '-7 days')
        GROUP BY u.id
        ORDER BY score ASC
        LIMIT 100;
    `).all({})

    res.json({
        a: rows.filter(r => r.difficulty === 'a'),
        b: rows.filter(r => r.difficulty === 'b'),
        c: rows.filter(r => r.difficulty === 'c')
    })
})


import crypto from 'crypto'
import { rateLimit, RateLimitError } from "./rate_limit.ts";
import { getCache, invalidateCache, setCache } from "./cache.ts";
import { DifficultyLeaderboard } from "./types.ts";

function verifyHash(score: number, difficulty: string, hash: string) {
    const secret = 's3cr3t-s@lt'
    const data = `${secret}:${difficulty}:${score}`
    const expected = crypto
        .createHash('sha256')
        .update(data)
        .digest('hex')

    return hash === expected
}
