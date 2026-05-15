'use client'

import {useState} from "react";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import { Todo } from "@/types";

export default function HomePage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    
    function handleAdd(title: string) {
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            createdAt: new Date()
        };
        setTodos([...todos, newTodo]);
    }


    function handleToggle(id: string) {
        setTodos(todos.map(todo => 
            todo.id === id ? {...todo, completed: !todo.completed} : todo
        ));
    }

    function handleDelete(id: string) {
        setTodos(todos.filter(todo => todo.id !== id));
    }

    const total =  todos.length
    const completed = todos.filter(todo => todo.completed).length

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
          />
        ))
      )}
    </main>
    )
}