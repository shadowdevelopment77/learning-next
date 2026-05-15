'use client'
import { Todo } from "@/types";

interface Props {
    todo: Todo
    onToggle: (id: string) => void
    onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mb-2">
            {}
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                className="w-4 h-4 cursor-pointer"
            />
            {}
            <span className={todo.completed? "flex-1 line-through text-gray-400": "flex-1 text-gray-800" }> 
                {todo.title}
            </span>
            {}
            <button
            onClick={() => onDelete(todo.id)}
            className="text-red-400 hover:text-red-600 text-sm px-2">Delete</button>
        </div>
    )
}