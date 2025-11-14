import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import AuthHeader from "@/components/AuthHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AA-GPT - Your AI-powered chat assistant",
  description: "AA-GPT is an AI chatbot built with Next.js, OpenAI, and AstraDB that allows you to have intelligent conversations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <SessionWrapper>
          <div className="min-h-screen flex flex-col">
            <AuthHeader />
            <main className="flex-1">{children}</main>
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}