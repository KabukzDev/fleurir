"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Invalid credentials.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Could not create account.");
      return;
    }

    setSuccess("Account created.");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="relative w-full max-w-100 bg-mist-950/50 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <img className="h-10 mb-2" src="/fleurir/logo_x1.png" alt="Fleurir Logo" />
          <h1 className="text-white text-2xl font-light tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-white/50 text-sm">
            {mode === "login"
              ? "Log in to your account"
              : "Begin your journey with us"}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/15 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-500/15 border border-green-400/30 text-green-200 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="name@example.com"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                placeholder="Password"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                required
              />
            </div>

            <button className="cursor-pointer w-full bg-flower-blue hover:bg-flower-blue/90 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] mt-2">
              Log In
            </button>

            <button
              type="button"
              onClick={() => setMode("signup")}
              className="w-full text-sm text-white/60 hover:text-white"
            >
              Don't have an account?
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                placeholder="@username"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                placeholder="Anna Rodriguez"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="name@example.com"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                placeholder="At least 6 characters"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                required
              />
            </div>

            <button className="cursor-pointer w-full bg-flower-blue hover:bg-flower-blue/90 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] mt-2">
              Create Account
            </button>

            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full text-sm text-white/60 hover:text-white"
            >
              Already have an account?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
