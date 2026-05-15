'use client'
import { Todo } from "@/types";
import { useState } from "react";

interface Props {
    todo: Todo
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string, title: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(todo.title);

    function handleSave(){
        if (editedTitle.trim() ==='') return
        onEdit(todo.id, editedTitle.trim());
        setIsEditing(false)
    }
    return (
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mb-2">
            {}
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                className="w-4 h-4 cursor-pointer"
            />
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="flex-1 border border-blue-300 rounded px-2 py-1 text-sm"
            autoFocus
          />
          <button onClick={handleSave} className="text-blue-500 text-sm px-2">
            save
          </button>
          <button onClick={() => setIsEditing(false)} className="text-gray-400 text-sm px-2">
            cancel
          </button>
        </>
      ) : (
        <>
          <span className={todo.completed
            ? "flex-1 line-through text-gray-400"
            : "flex-1 text-gray-800"
          }>
            {todo.title}
          </span>
          <button onClick={() => setIsEditing(true)} className="text-blue-400 text-sm px-2">
            edit
          </button>
          <button onClick={() => onDelete(todo.id)} className="text-red-400 text-sm px-2">
            delete
          </button>
        </>
      )}
    </div>
    )
}