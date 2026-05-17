export interface Todo{
    id: number
    title: string
    is_complete: boolean
    created_at: Date
    is_deleted: boolean
    deleted_at: Date | null
    completed_at: Date | null
    user_id: number | null
}

export interface User {
    id: number
    name: string
    email: string
    role: string
    created_at: Date
    is_deleted: boolean
    deleted_at: Date | null
    is_active: boolean
}

export interface Completed {
    id: number
    title: string
    completed_at: Date | null
    user_id: number | null
}

export interface ApiResponse<T> {
    data: T
    message: string
    success: boolean
}