"use client";
import React from "react";

export default function ChatList({ chats, onSelect }: any) {
  return (
    <aside className="w-64 border-r p-2">
      <button
        onClick={() => onSelect(null)}
        className="w-full bg-blue-500 text-white p-2 rounded mb-2"
      >
        + New Chat
      </button>
      <ul>
        {chats.map((c: any) => (
          <li
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="cursor-pointer p-2 hover:bg-gray-200"
          >
            {c.title}
          </li>
        ))}
      </ul>
    </aside>
  );
}
