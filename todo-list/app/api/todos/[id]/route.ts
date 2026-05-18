import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: Promise <{ id: string }> }


async function getUserIdFromSession(request: NextRequest): Promise<number | null> {
    const sessionId = request.cookies.get('session_id')?.value

    if (!sessionId) {
        return null
    }

    const result = await pool.query(
        `SELECT user_id FROM sessions WHERE id = $1 AND expires_at > NOW()`,
        [sessionId]
    )

    if (result.rows.length === 0) {
        return null
    }

    return result.rows[0].user_id
}

// PUT /api/todos/[id] — toggle complete or edit title
export async function PUT(request: NextRequest, { params }: Params) {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized", data: null },
            { status: 401 }
        );
    }



    const { id } = await params

  console.log('PUT /api/todos/' + id )

  const body = await request.json()
  
  const result = await pool.query(
    `UPDATE todos
     SET
       title        = COALESCE($1, title),
       is_complete  = COALESCE($2, is_complete),
       completed_at = CASE 
                        WHEN $2 = true  THEN NOW()
                        WHEN $2 = false THEN NULL
                        ELSE completed_at
                      END
     WHERE id = $3
     AND is_deleted = false
     RETURNING *`,
    [body.title ?? null, body.is_complete ?? null, id]
  )

  if (result.rows.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Todo not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    data:    result.rows[0],
    message: 'Todo updated',
    success: true,
  })
}

// DELETE /api/todos/[id] — soft delete
export async function DELETE(request: NextRequest, { params }: Params) {

    const userId = await getUserIdFromSession(request);
    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized", data: null },
            { status: 401 }
        );
    }

    const { id } = await params

  console.log('DELETE /api/todos/' + id)

  
  await pool.query(
    `UPDATE todos
     SET is_deleted = true,
         deleted_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  )

  return NextResponse.json({
    data:    null,
    message: 'Todo deleted',
    success: true,
  })
}