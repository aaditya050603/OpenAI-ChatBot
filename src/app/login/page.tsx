"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AtSign, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");

    if (!emailValid(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) setError(result.error);
    else router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center" suppressHydrationWarning>
      <div className="flex w-full max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden">
        <div className="w-1/2 hidden md:block">
          <img src="/login-illustration.svg" alt="Login illustration" className="object-cover w-full h-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 p-8 sm:p-12"
        >
          <h1 className="text-3xl font-bold mb-2 text-text-primary">Welcome Back!</h1>
          <p className="text-text-secondary mb-8">Login to continue your chat with AA-GPT.</p>

          {error && <p className="text-red-400 mb-4 text-center bg-red-900/20 p-3 rounded-lg" role="alert">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="mb-4 relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass pl-12"
                required
                aria-required
              />
            </div>

            <div className="mb-6 relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass pl-12"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                loading ? "bg-gray-600 cursor-not-allowed" : "btn-primary"
              }`}
            >
              {loading ? "Signing in..." : "Login"}
            </motion.button>
          </form>

          <p className="mt-8 text-sm text-center text-text-secondary">
            Don’t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}