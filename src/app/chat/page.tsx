"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";

/**
 * Chat Page
 * - Displays list of chats (left sidebar)
 * - Displays selected chat window (right panel)
 * - Handles new chat creation, selection, and deletion
 */
export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // ✅ Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => setMounted(true), []);

  const userId = session?.user?.email || "";

  // ✅ Fetch user's chat list
  async function fetchChats() {
    if (!userId) return;
    try {
      const res = await fetch(`/api/chats/${userId}`);
      if (!res.ok) throw new Error("Failed to load chats");
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error("❌ Failed to fetch chats:", err);
    }
  }

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  if (!mounted || status === "loading")
    return (
      <main className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <p className="animate-pulse text-gray-400">Loading chat interface...</p>
      </main>
    );

  // ✅ Create new chat
  const createNewChat = async () => {
    try {
      const res = await fetch("/api/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error("Failed to create new chat");

      const data = await res.json();
      const newChat = {
        id: data.chatId,
        title: "New Chat",
        userId: userId,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(data.chatId);
    } catch (err) {
      console.error("❌ New chat error:", err);
    }
  };

  // ✅ Delete chat locally
  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) setActiveChatId(null);
  };

  return (
    <main className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Left Sidebar: Chat List */}
      <ChatList
        chats={chats}
        onSelect={setActiveChatId}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
      />

      {/* Right Side: Chat Window */}
      <div className="flex-1 p-4 md:p-6">
        <ChatWindow
          userId={userId}
          chatId={activeChatId}
          setChatId={setActiveChatId}
          refreshChats={fetchChats}
          onDelete={deleteChat}
        />
      </div>
    </main>
  );
}
