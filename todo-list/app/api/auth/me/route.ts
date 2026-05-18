// app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    )
  }
  

  return NextResponse.json({
    data: {
        name: session.name || 'User'
    },
    success: true,
  })
}