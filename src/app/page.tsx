"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/login");
    return null;
  }

  const userId = session.user.email; // use email for linking chats

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl border rounded-xl shadow-md bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex-1 text-center">
            🤖 AI Chatbot (OpenAI + AstraDB)
          </h1>
          <button
            onClick={() => signOut()}
            className="text-sm text-blue-500 underline"
          >
            Logout
          </button>
        </div>
        <ChatWindow userId={userId} />
      </div>
    </main>
  );
}
