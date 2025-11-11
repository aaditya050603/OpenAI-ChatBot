"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleRegister(e: any) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) setError(data.error);
    else {
      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 1500);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded mb-3" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded mb-3" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded mb-3" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="w-full border p-2 rounded mb-4" />

        <button className="w-full bg-green-500 text-white p-2 rounded">Register</button>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
