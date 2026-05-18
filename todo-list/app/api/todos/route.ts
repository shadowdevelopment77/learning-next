import {NextRequest, NextResponse} from "next/server";
import pool from '@/lib/db';
import {Todo, ApiResponse} from "@/types";


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


const todos: Todo[] = [];


export async function GET(request: NextRequest) {
    console.log("GET /api/todos");

    const userId = await getUserIdFromSession(request);
    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized", data: null },
            { status: 401 }
        );
    }
    

    const result = await pool.query(
        'Select * FROM todos WHERE is_deleted = false AND user_id = $1 ORDER BY created_at DESC',
        [userId]
    )

    const response: ApiResponse<Todo[]> = {
        data: result.rows,
        message: "Todos fetched successfully",
        success: true,
    };
    return NextResponse.json(response);
}


export async function POST(request: NextRequest){
    console.log("POST /api/todos hit")

    const userId = await getUserIdFromSession(request);
    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized", data: null },
            { status: 401 }
        );
    }

    const body = await request.json();

    if(!body.title || body.title.trim() === ""){
        return NextResponse.json(
            { success: false, message: "Title is required", data: null },
            { status: 400 }
        );
    }

    const result = await pool.query(
        'INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *',
        [body.title.trim(), userId]
    );
    
    console.log("todos after POST: ", todos)
    const response: ApiResponse<Todo> = {
        data: result.rows[0],
        message: "Todo created successfully",
        success: true,
    };
    return NextResponse.json(response, { status: 201 });
}