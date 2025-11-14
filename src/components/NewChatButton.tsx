"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function NewChatButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="btn btn-primary inline-flex items-center gap-2"
    >
      <Plus size={20} />
      New Chat
    </motion.button>
  );
}