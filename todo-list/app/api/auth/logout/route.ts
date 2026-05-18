// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function POST() {
  await deleteSession()

  return NextResponse.json({
    data:    null,
    message: 'Logged out successfully',
    success: true,
  })
}