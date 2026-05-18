import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, password } = body

  // basic validation
  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, message: 'Name, email and password are required' },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { success: false, message: 'Password must be at least 6 characters' },
      { status: 400 }
    )
  }

  // check if email already exists
  const existing = await pool.query(
    'SELECT id, is_deleted FROM users WHERE email = $1',
    [email]
  )

  if (existing.rows.length > 0) {
    const user = existing.rows[0]

    // your soft delete discussion — if account exists but deleted
    if (user.is_deleted) {
      return NextResponse.json(
        { success: false, message: 'Account exists but was deleted. Contact admin to restore.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Email already registered' },
      { status: 409 }
    )
  }

  // hash the password — never store plain text
  // 12 = salt rounds, higher = slower = more secure
  const hashedPassword = await bcrypt.hash(password, 12)

  // insert new user
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'staff')
     RETURNING id, name, email, role`,
    [name, email, hashedPassword]
  )

  const newUser = result.rows[0]

  // create session — user is logged in immediately after register
  await createSession(newUser.id)

  return NextResponse.json({
    data:    { id: newUser.id, name: newUser.name, email: newUser.email },
    message: 'Account created successfully',
    success: true,
  }, { status: 201 })
}