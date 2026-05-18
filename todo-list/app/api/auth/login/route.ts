// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: 'Email and password are required' },
      { status: 400 }
    )
  }

  // find user by email
  const result = await pool.query(
    `SELECT * FROM users
     WHERE email = $1
     AND is_deleted = false
     AND is_active  = true`,
    [email]
  )

  if (result.rows.length === 0) {
    // don't say "email not found" — security risk
    // always say generic message
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  }

  const user = result.rows[0]

  // compare entered password with hashed password in DB
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  }

  // create session
  await createSession(user.id)

  return NextResponse.json({
    data: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
    message: 'Login successful',
    success: true,
  })
}