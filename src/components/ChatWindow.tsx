"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import axios from "axios";

export default function ChatWindow({
  userId,
  chatId,
  setChatId,
  refreshChats,
  onDelete,
}: {
  userId: string;
  chatId: string | null;
  setChatId: (id: string | null) => void;
  refreshChats: () => void;
  onDelete: (chatId: string) => void;
}) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧩 Fetch messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    async function loadChat() {
      try {
        const res = await fetch(`/api/chat/${chatId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("❌ Load chat failed:", err);
      }
    }
    loadChat();
  }, [chatId]);

  // 🧩 Send message
  async function sendMessage() {
    if (!input.trim()) return;
    if (!userId) {
      alert("Please log in first");
      return;
    }
    
    setLoading(true);
    const userMessage = { role: "user", content: input };

    // show immediately
    setMessages((prev) => [...prev, userMessage]);
    const msg = input;
    setInput("");

    try {
      const res = await axios.post("/api/chat", { message: msg, chatId, userId });
      if (res.data.chatId && !chatId) setChatId(res.data.chatId);

      if (res.data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
      }
      refreshChats();
    } catch (err: any) {
      console.error("❌ Send message error:", err);
      alert(`Error: ${err.response?.data?.error || err.message || "Failed to send message"}`);
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  // 🧩 Delete current chat
  async function deleteChat() {
    if (!chatId) return;
    try {
      await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
      onDelete(chatId);
      setChatId(null);
      setMessages([]);
    } catch (err) {
      console.error("❌ Delete chat failed:", err);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900/40 glass-card rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          🤖 AI Chat
        </h2>
        {chatId && (
          <button
            onClick={deleteChat}
            className="p-2 bg-gray-800 rounded-full hover:bg-red-500 transition"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Start your first message 💬</p>
        ) : (
          messages.map((m, i) => (
            <motion.div
              key={i}
              className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))
        )}
        {loading && (
          <p className="text-gray-400 text-sm text-center mt-2">🤖 Thinking...</p>
        )}
      </div>

      {/* Input */}
      <div className="relative p-4 border-t border-gray-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="input-glass w-full pr-14 text-sm"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={loading}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-pink-500/50 transition"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}
