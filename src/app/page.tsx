"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { FiMessageCircle, FiLock, FiClock } from "react-icons/fi";
import { useSession } from "next-auth/react";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 120 },
  },
};

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3 },
          },
        }}
        className="text-center space-y-6"
      >
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
        >
          Welcome to AA-GPT
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-gray-300 text-lg max-w-xl mx-auto"
        >
          Your AI-powered assistant for chatting, analysis, and creativity.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 mt-6"
        >
          <Link
            href="/chat"
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold text-white shadow-lg hover:scale-105 transition-transform"
          >
            Start Chatting
          </Link>

          {!session && (
            <Link
              href="/login"
              className="px-6 py-3 bg-gray-800 rounded-lg font-semibold text-gray-200 hover:bg-gray-700 transition"
            >
              Log In
            </Link>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
