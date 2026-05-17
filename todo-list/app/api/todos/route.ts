import {NextRequest, NextResponse} from "next/server";
import pool from '@/lib/db';
import {Todo, ApiResponse} from "@/types";


type Params = { params: { id: string } }
const todos: Todo[] = [];


export async function GET() {
    console.log("GET /api/todos");

    const result = await pool.query(
        'Select * FROM todos WHERE is_deleted = false ORDER BY created_at DESC'
    )

    const response: ApiResponse<Todo[]> = {
        data: result.rows,
        message: "Todos fetched successfully",
        success: true,
    };
    return NextResponse.json(response);
}
export async function PUT(request: NextRequest, { params }: Params) {
        console.log("PUT /api/todos hit" + params.id)

        const body = await request.json();
        const id = params.id;

        const result = await pool.query(
            'UPDATE todos SET title = COALESCE($1, title), is_complete = COALESCE($2, is_complete), completed_at = CASE WHEN $2 = true THEN NOW() WHEN $2 = false THEN NULL ELSE completed_at END WHERE id = $3 RETURNING *',
            [body.title ?? null, body.is_complete ?? null, id]
        );
        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Todo not found", data: null },
                { status: 404 }
            );
            
        }
        return NextResponse.json({ 
            data: result.rows[0],
            message: "Todo updated successfully",
            success: true,
        });
}


export async function DELETE(request: NextRequest, { params }: Params) {
    console.log("DELETE /api/todos hit" + params.id)

    const id = params.id;

    await pool.query(
        'UPDATE todos SET is_deleted = true, deleted_at = NOW() WHERE id = $1',
        [id]
    );

  return NextResponse.json({ 
    data: null,
    message: "Todo deleted successfully",
    success: true,
   })
}


export async function POST(request: NextRequest){
    console.log("POST /api/todos hit")
    const body = await request.json();

    if(!body.title || body.title.trim() === ""){
        return NextResponse.json(
            { success: false, message: "Title is required", data: null },
            { status: 400 }
        );
    }

    const result = await pool.query(
        'INSERT INTO todos (title) VALUES ($1) RETURNING *',
        [body.title.trim()]
    );
    
    console.log("todos after POST: ", todos)
    const response: ApiResponse<Todo> = {
        data: result.rows[0],
        message: "Todo created successfully",
        success: true,
    };
    return NextResponse.json(response, { status: 201 });
}