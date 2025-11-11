"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ChatWindow({ userId }: { userId: string }) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);
  if (!isClient) return null; // prevents hydration mismatch

  async function sendMessage() {
    if (!input) return;
    const res = await axios.post("/api/chat", { message: input, chatId, userId });
    setChatId(res.data.chatId);
    setMessages((m) => [
      ...m,
      { role: "user", content: input },
      { role: "assistant", content: res.data.reply },
    ]);
    setInput("");
  }

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((m) => (
          <div key={m.role + m.content.slice(0, 10)} className={m.role === "user" ? "text-right" : "text-left"}>
            <p className="inline-block bg-gray-100 p-2 rounded mb-2">{m.content}</p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
