import {NextRequest, NextResponse} from "next/server";
import pool from '@/lib/db';
import {Todo, ApiResponse} from "@/types";



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