"use client";

import { useSession } from "next-auth/react";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  const { data: session, status } = useSession();

  // 🧩 Show loading screen while session is being fetched
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading session...</p>
      </main>
    );
  }

  // 🧩 If user is not logged in, continue as a guest (optional)
  const userId = session?.user?.email ?? "guest@example.com";

  // 🧩 Main chat window
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          🤖 AI Chat Assistant
        </h1>
        <ChatWindow userId={userId} />
        {!session && (
          <p className="text-center text-sm text-gray-500 mt-4">
            You are chatting as a <span className="font-semibold">guest</span>.
            <br />
            <a
              href="/login"
              className="text-blue-600 hover:underline ml-1"
            >
              Log in
            </a>{" "}
            to save your chats.
          </p>
        )}
      </div>
    </main>
  );
}
