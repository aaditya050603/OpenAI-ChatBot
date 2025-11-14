"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, PlusCircle, MessageSquare } from "lucide-react";

export default function ChatList({
  chats = [],
  onSelect,
  activeChatId,
  onNewChat,
}: {
  chats: any[];
  onSelect: (id: string) => void;
  activeChatId: string | null;
  onNewChat: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="hidden md:flex flex-col w-80 h-screen p-4 glass-card border-r border-gray-800 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AA-GPT
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNewChat}
          className="p-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-md"
          title="Start new chat"
        >
          <PlusCircle size={20} />
        </motion.button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-glass w-full pl-10 text-sm"
        />
      </div>

      {/* Chat list */}
      <div className="flex flex-col gap-2">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center mt-10 text-gray-500">
            <MessageSquare className="w-8 h-8 mb-2 text-gray-600" />
            <p className="text-sm text-center">No chats found. Start one!</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <motion.button
              key={chat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(chat.id)}
              className={`text-left w-full p-3 rounded-lg transition-all ${
                activeChatId === chat.id
                  ? "bg-gradient-to-r from-primary to-secondary text-white"
                  : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60"
              }`}
            >
              <p className="font-medium truncate">{chat.title || "Untitled Chat"}</p>
              <p className="text-xs text-gray-400 mt-1 truncate">
                {chat.messages?.[0]?.content || "No messages yet..."}
              </p>
            </motion.button>
          ))
        )}
      </div>
    </aside>
  );
}
