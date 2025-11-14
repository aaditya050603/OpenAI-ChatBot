"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, LogIn, UserPlus, LogOut, MessageSquare } from "lucide-react";

export default function AuthHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full glass-card border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
            AA
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">AA-GPT</h1>
            
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
            <Home size={16} />
            <span>Home</span>
          </Link>

          {session?.user ? (
            <>
              <Link href="/chat" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
                <MessageSquare size={16} />
                <span>Chat</span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 border border-white/20 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <span className="text-sm font-medium text-text-primary">{session.user?.name ?? session.user?.email}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 glass-card shadow-lg z-10"
                    >
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-white/10 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link href="/register" className="text-sm btn btn-primary flex items-center gap-2">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}