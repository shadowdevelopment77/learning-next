'use client'

import {useEffect, useState} from "react";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import { Todo } from "@/types";

export default function HomePage() {
    const [todos, setTodos] = useState<Todo[]>([]);

    useEffect(() => {
      fetchTodos()
    }, [])

    async function fetchTodos() {
        const res = await fetch("/api/todos");
        const data = await res.json();
        setTodos(data.data);
    }
    
    async function handleAdd(title: string) {
        const res = await fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });
        const json  = await res.json();
        if(json.success){
            setTodos([json.data, ...todos]);
        }
    }


    async function handleToggle(id: number) {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const res = await fetch(`/api/todos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_complete: !todo.is_complete })
        });
        const json  = await res.json();
        if(json.success){
            setTodos(todos.map(t => 
                t.id === id ? json.data : t ));
        }
    }

    async function handleEdit(id: number, newTitle: string) {
        const res = await fetch(`/api/todos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle })
        });
        const json  = await res.json();
        if(json.success){
            setTodos(todos.map(t => 
                t.id === id ? json.data : t ));
        }
    }

   async function handleDelete(id: number) {
        await fetch(`/api/todos/${id}`, {
            method: "DELETE",
        });
        setTodos(todos.filter(t => t.id !== id));
    }

    const total =  todos.length
    const completed = todos.filter(t => t.is_complete).length

    return (
        <main className="max-w-lg mx-auto mt-12 px-4">

      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        My To-Do List
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {completed} of {total} tasks completed
      </p>

      {/* Form — passes our handleAdd function down */}
      <TodoForm onAdd={handleAdd} />

      {/* List — maps over todos, renders one TodoItem per todo */}
      {todos.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          No tasks yet. Add one above!
        </p>
      ) : (
        todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))
      )}
    </main>
    )
}