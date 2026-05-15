export interface Todo{
    id: string
    title: string
    completed: boolean
    createdAt: Date
}

export type CreateTodoInput = Omit<Todo, "id" | "createdAt">;


export interface ApiResponse<T> {
    data: T
    message: string
    success: boolean
}