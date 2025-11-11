import type { Metadata } from "next";
import "../styles/globals.css";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "GPT - Chatbot with OpenAI API",
  description: "AI chatbot built with Next.js, OpenAI, and AstraDB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
