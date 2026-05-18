"use client"; // Required for form handling/buttons

import { useState } from "react";
import Link from "next/link";

type Mode = "login" | "signup";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    if (res.ok) {
      alert("Logged in!");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateUsername = (username: string) => {
    return /^[a-z0-9_]{3,20}$/.test(username);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(form.username)) {
      setError(
        "Username must be 3-20 characters, lowercase only, and can contain numbers or underscores."
      );
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess("Account created successfully!");
      // add an email verification step here later on
      setMode("login");
    } else {
      setError("Something went wrong.");
    }
  };

// export default function Login() {
//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Logic for auth goes here
//     console.log("Logging in...");
//   };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full" />
      <div className="relative w-full max-w-100 bg-mist-950/50 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img className="h-10 mb-2" src="/fleurir/logo_x1.png" alt="Fleurir Logo" />
          <h1 className="text-white text-2xl font-light tracking-tight">
            {mode === "login"
            ? "Welcome back"
            : mode === "signup"
            ? "Create account"
            : "Tell us your name"}
          </h1>
          <p className="text-white/50 text-sm">
            {mode === "login"
            ? "Log in to your account"
            : mode === "signup"
            ? "Begin your journey with us"
            : "Tell us your name"}
          </p>
        </div>

        {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <input 
              type="email" 
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
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
              required
            />
          </div>

          <button type="submit" className="cursor-pointer w-full bg-flower-blue hover:bg-flower-blue/90 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] mt-2">
            Log In
          </button>

          <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 w-full">
            <div className="h-px bg-white/10 grow" />
            <span className="text-white/30 text-xs uppercase tracking-widest">or</span>
            <div className="h-px bg-white/10 grow" />
          </div>

          <button className="cursor-pointer   w-full bg-white text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition">
            {/* You'd put a Google SVG icon here */}
            Continue with Google
          </button>

          <p className="text-sm text-white/60 cursor-pointer" onClick={() => setMode("signup")}>
              Don't have an account?
          </p>
        </div>
        </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Username
              </label>
              <div className="fixed top-5 right-5 bg-red-500 text-white px-4 py-3 rounded-xl shadow-xl">
                {error}
              </div>
              <input 
                type="text"
                placeholder="@username"
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
                value="demo@gofleurir.com"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                disabled
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
                Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
                required
              />
            </div>

            <button type="submit" className="cursor-pointer w-full bg-flower-blue hover:bg-flower-blue/90 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] mt-2">
              Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}