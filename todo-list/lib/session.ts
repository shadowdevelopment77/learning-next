// lib/session.ts
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// create a new session for a user after login/register
export async function createSession(userId: number) {
  const sessionId = crypto.randomUUID()  // random unique id

  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [sessionId, userId]
  )

  // set the cookie in the browser
  const cookieStore = await cookies()
  cookieStore.set('session_id', sessionId, {
    httpOnly: true,   // JS cannot read this cookie — security
    secure:   false,  // true in production (requires HTTPS)
    maxAge:   60 * 60 * 24 * 7,  // 7 days in seconds
    path:     '/',
  })

  return sessionId
}

// get the current logged-in user from the cookie
export async function getSession() {
  const cookieStore = await cookies()
  const sessionId   = cookieStore.get('session_id')?.value

  if (!sessionId) return null

  const result = await pool.query(
    `SELECT s.id, s.user_id, s.expires_at,
            u.name, u.email, u.role
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = $1
     AND s.expires_at > NOW()
     AND u.is_deleted = false
     AND u.is_active  = true`,
    [sessionId]
  )

  if (result.rows.length === 0) return null

  return result.rows[0]  // returns user info attached to session
}

// delete session on logout
export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId   = cookieStore.get('session_id')?.value

  if (sessionId) {
    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId])
  }

  cookieStore.delete('session_id')
}