import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: Promise <{ id: string }> }

// PUT /api/todos/[id] — toggle complete or edit title
export async function PUT(request: NextRequest, { params }: Params) {

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

    const { id } = await params

  console.log('DELETE /api/todos/' + id)

  
  await pool.query(
    `UPDATE todos
     SET is_deleted = true,
         deleted_at = NOW()
     WHERE id = $1`,
    [id]
  )

  return NextResponse.json({
    data:    null,
    message: 'Todo deleted',
    success: true,
  })
}