"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, User, Bot } from "lucide-react";
import axios from "axios";

export default function ModernChat({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    try {
      const res = await axios.post("/api/chat", { message: userMessage, chatId, userId });
      setChatId(res.data.chatId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Oops! Something went wrong. Try again." },
      ]);
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto h-[70vh] flex flex-col glass-card shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                  <Bot size={24} />
                </div>
                <h2 className="font-semibold text-text-primary">AI Chat Assistant</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                  <p>Hello! I'm your friendly AI assistant. How can I help you today?</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-end gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white flex-shrink-0">
                        <Bot size={20} />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-md ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-primary to-secondary text-white rounded-br-none"
                          : "bg-white/10 text-text-primary rounded-bl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-text-secondary flex-shrink-0">
                        <User size={20} />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="input-glass w-full pr-16"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}