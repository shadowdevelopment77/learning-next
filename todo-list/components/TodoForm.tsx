'use client'

import React, { useState } from "react";

interface Props {
    onAdd: (title: string) => void
}

export default function TodoForm({ onAdd }: Props) {
    const [title, setTitle] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if(title.trim() === "") return;
        onAdd(title);
        setTitle("");
    }
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 border border-gray-300 rounded-lg
                   px-4 py-2 text-sm focus:outline-none
                   focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white
                   px-4 py-2 rounded-lg text-sm"
            >
                Add
            </button>
        </form>
    )
}
