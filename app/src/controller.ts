import { Router } from "express";
import { db } from "./db_init.js";

import crypto from 'crypto'
import { rateLimit, RateLimitError } from "./rate_limit.js";
import { getCache, invalidateCache, setCache } from "./cache.js";
import type { DifficultyLeaderboard, DifficultyTier, Ranking, UserDbId } from "./types.js";
import { getMonthsUTC, getTodaysUTC, getWeeksUTC, getYearsUTC } from "./dates.js";
import { getDefaultHighWaterMark } from "stream";
import { DEV } from "./config.js";


export const gen_id8 = () => Math.random().toString(16).slice(2, 10)

declare global {
  namespace Express {
    interface Request {
      user_id?: UserDbId;
    }
  }
}

class LockedDayError extends Error {}
class InvalidHashError extends Error {}



export const router = Router()

router.use(async (req, res, next) => {

  let ip = req.ip
  if (ip) {
      await rateLimit(ip, 'ip_fast', 15, 5)
      await rateLimit(ip, 'ip_hour', 100, 3600)
  }

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
      ).run(sessionId)

    } else {
      // Stale or invalid cookie
      res.clearCookie('morchess_session')
      sessionId = undefined
    }
  }

  // Create new session if needed
  if (!sessionId) {
    sessionId = gen_id8()
    userId = gen_id8()

    await db.prepare(
      `INSERT INTO users (id, created_at)
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
      secure: !DEV,
      maxAge: 1000 * 60 * 60 * 24 * 365
    })
  }

  // Invariant satisfied
  req.user_id = userId!
  next()
})

router.post('/handle', async (req, res) => {

    await rateLimit(req.user_id!, 'handle_fast', 3, 10)
    await rateLimit(req.user_id!, 'handle_hour', 3, 3600)

    const { handle } = req.body

    if (!handle || handle.length < 3 || handle.length > 8) {
        return res.status(400).json({ error: 'Invalid handle' })
    }

    try {
        await db.prepare(
            `UPDATE users SET handle = ?, created_at = ? WHERE users.id = ?`
        ).run(
            handle,
            Date.now(),
            req.user_id,
        )


        const today = getTodaysUTC()
        const thisWeek = getWeeksUTC()
        const thisMonth = getMonthsUTC()
        const thisYear = getYearsUTC()

        invalidateCache(`daily:${today}`)
        invalidateCache(`weekly:${thisWeek}:a`)
        invalidateCache(`weekly:${thisWeek}:b`)
        invalidateCache(`weekly:${thisWeek}:c`)
        /* maybe remove */
        invalidateCache(`weekly:${thisMonth}:a`)
        invalidateCache(`weekly:${thisMonth}:b`)
        invalidateCache(`weekly:${thisMonth}:c`)
        invalidateCache(`weekly:${thisYear}:a`)
        invalidateCache(`weekly:${thisYear}:b`)
        invalidateCache(`weekly:${thisYear}:c`)

        res.json({ ok: true })
    } catch (e) {
        res.status(500).json({ error: 'Failed to set handle' })
    }
})


router.post('/score', async (req, res) => {


    await rateLimit(req.user_id!, 'score_fast', 5, 15)
    await rateLimit(req.user_id!, 'score_hour', 10, 3600)

    const { score, difficulty, hash } = req.body
    const today = getTodaysUTC()


    if (!verifyHash(score, difficulty, hash)) {
        return res.status(400).json({ error: 'Invalid submission' })
    }

    if (!['a', 'b', 'c'].includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty' })
    }

    if (!Number.isInteger(score) || score < 0 || score > 10_000) {
        return res.status(400).json({ error: 'Invalid score' })
    }

    try {


        const row = await db.prepare<[string, string, string], { score: number }>(`
            SELECT score FROM daily_scores
            WHERE user_id = ? AND date_utc = ? AND difficulty = ?
        `).get(req.user_id!, today, difficulty)

        if (row) {
            return res.json({ ok: true, score: row.score })
        }

        await db.prepare(
            `INSERT INTO daily_scores 
             (user_id, date_utc, difficulty, score, created_at)
             VALUES (?, ?, ?, ?, ?)`,
        ).run(
            req.user_id,
            today,
            difficulty,
            score,
            Date.now()
        )

        const thisWeek = getWeeksUTC()
        const thisMonth = getMonthsUTC()
        const thisYear = getYearsUTC()



        invalidateCache(`daily:${today}`)
        invalidateCache(`weekly:${thisWeek}`)
        /* maybe remove */
        invalidateCache(`monthly:${thisMonth}`)
        invalidateCache(`yearly:${thisYear}`)



        res.json({ ok: true })
    } catch {
        res.status(409).json({ error: 'Already submitted' })
    }
})


router.get('/daily', async (req, res) => {

    await rateLimit(req.user_id!, 'handle_fast', 8, 10)
    await rateLimit(req.user_id!, 'handle_hour', 60, 3600)

    const date = getTodaysUTC()

    const leaderboard = await computeDailyLeaderboard(date, req.user_id!)
    res.send(leaderboard)
})

router.get('/weekly', async (req, res) => {
    const date = getWeeksUTC()
    const leaderboard = await computeWeeklyLeaderboard(date, req.user_id!)
    res.send(leaderboard)
})

router.get('/monthly', async (req, res) => {
    const date = getMonthsUTC()
    const leaderboard = await computeWeeklyLeaderboard(date, req.user_id!)
    res.send(leaderboard)
})


router.get('/yearly', async (req, res) => {
    const date = getYearsUTC()
    const leaderboard = await computeWeeklyLeaderboard(date, req.user_id!)
    res.send(leaderboard)
})

const rows2leaderboard = (rows: LeaderboardRow[], tier: DifficultyTier, user_id: UserDbId) => {

    let list: Ranking[] = rows.map((row, i) => ({
        rank: i + 1,
        handle: row.handle,
        score: row.score,
        created_at: row.created_at
    })).filter(_ => _.handle !== null)

    let i_you = rows.findIndex(_ => _.user_id === user_id)
    let you = i_you !== -1 ? {
        rank: i_you + 1,
        handle: rows[i_you].handle,
        score: rows[i_you].score,
        created_at: rows[i_you].created_at
    } : undefined

    return {
        list,
        you
    }
}

type LeaderboardRow = { user_id: UserDbId, handle: string, score: number, created_at: number }
async function computeDailyLeaderboard(date: string, user_id: UserDbId) {

    let rows: (LeaderboardRow & { difficulty: DifficultyTier })[]

    let cacheKey = `daily:${date}`
    let cached = getCache<(LeaderboardRow & { difficulty: DifficultyTier } )[]>(cacheKey)

    if (cached) {
        rows = cached
    } else {
        rows = await db.prepare<string, LeaderboardRow & { difficulty: DifficultyTier }>(`
        SELECT u.id as user_id, u.handle, d.score, d.created_at, d.difficulty
        FROM daily_scores d
        JOIN users u ON u.id = d.user_id
        WHERE d.date_utc = ?
        ORDER BY d.score ASC
        LIMIT 300
    `).all(date)
        setCache(cacheKey, rows, 30 * 60_000)
    }

    return {
        a: rows2leaderboard(rows.filter(_ => _.difficulty === 'a'), 'a', user_id),
        b: rows2leaderboard(rows.filter(_ => _.difficulty === 'b'), 'b', user_id),
        c: rows2leaderboard(rows.filter(_ => _.difficulty === 'c'), 'c', user_id),
    }
}

async function computeWeeklyLeaderboard(since: string, user_id: UserDbId) {

    const get_rows_by_difficulty = db.prepare<[string, DifficultyTier], LeaderboardRow>(`
        SELECT u.id as user_id, u.handle,
        AVG(d.score) as score,
        MIN(d.created_at) as created_at
        FROM daily_scores d
        JOIN users u ON u.id = d.user_id
        WHERE d.date_utc >= ?
        AND d.difficulty = ?
        GROUP BY u.id
        ORDER BY score ASC
        LIMIT 100;
    `)

    const with_cache = async (tier: DifficultyTier) => {
        let rows: LeaderboardRow[]

        let cacheKey = `weekly:${since}:${tier}`
        let cached = getCache<LeaderboardRow[]>(cacheKey)

        if (cached) {
            rows= cached
        } else {
            rows = await get_rows_by_difficulty.all(since, tier)
            setCache(cacheKey, rows, 30 * 60_000)
        }
        return rows
    }

    let a_rows = await with_cache('a')
    let b_rows = await with_cache('b')
    let c_rows = await with_cache('c')

    return {
        a: rows2leaderboard(a_rows, 'a', user_id),
        b: rows2leaderboard(b_rows, 'b', user_id),
        c: rows2leaderboard(c_rows, 'c', user_id),
    }
}

function verifyHash(score: number, difficulty: string, hash: string) {
    const secret = 's3cr3t-s@lt'
    const data = `${secret}:${difficulty}:${score}`
    const expected = crypto
        .createHash('sha256')
        .update(data)
        .digest('hex')

    return hash === expected
}
