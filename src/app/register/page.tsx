"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, AtSign, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleRegister(e: any) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name?.trim() || !form.email?.trim() || !form.password) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error);
    else {
      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 1500);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center" suppressHydrationWarning>
      <div className="flex w-full max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 p-8 sm:p-12"
        >
          <h1 className="text-3xl font-bold mb-2 text-text-primary">Create an Account</h1>
          <p className="text-text-secondary mb-8">Join AA-GPT and start chatting with AI.</p>

          {error && <p className="text-red-400 mb-4 text-center bg-red-900/20 p-3 rounded-lg" role="alert">{error}</p>}
          {success && <p className="text-green-400 mb-4 text-center bg-green-900/20 p-3 rounded-lg">{success}</p>}

          <form onSubmit={handleRegister}>
            <div className="mb-4 relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
              <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} className="input-glass pl-12" />
            </div>

            <div className="mb-4 relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
              <input name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input-glass pl-12" />
            </div>

            <div className="mb-4 relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
              <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} className="input-glass pl-12" />
            </div>

            <div className="mb-6 relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
              <input name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} className="input-glass pl-12" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                loading ? "bg-gray-600 cursor-not-allowed" : "btn-primary"
              }`}
            >
              {loading ? "Registering..." : "Register"}
            </motion.button>
          </form>

          <p className="mt-8 text-sm text-center text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </p>
        </motion.div>
        <div className="w-1/2 hidden md:block">
          <img src="/register-illustration.svg" alt="Registration illustration" className="object-cover w-full h-full" />
        </div>
      </div>
    </div>
  );
}