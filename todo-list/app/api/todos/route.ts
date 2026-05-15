import {NextRequest, NextResponse} from "next/server";
import {Todo, ApiResponse} from "@/types";

const todos: Todo[] = [];


export async function GET() {
    console.log("GET /api/todos");
    const response: ApiResponse<Todo[]> = {
        data: todos,
        message: "Todos fetched successfully",
        success: true,
    };
    return NextResponse.json(response);
}
export async function PUT() {
        console.log("PUT /api/todos hit")
  return NextResponse.json({ success: true })
}


export async function DELETE() {
    console.log("DELETE /api/todos hit")


  return NextResponse.json({ success: true })
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
     const newTodo: Todo = {
        id: crypto.randomUUID(),
        title: body.title.trim(),
        completed: false,
        createdAt: new Date()
    };
    todos.push(newTodo);

    console.log("todos after POST: ", todos)
    const response: ApiResponse<Todo> = {
        data: newTodo,
        message: "Todo created successfully",
        success: true,
    };
    return NextResponse.json(response, { status: 201 });
}