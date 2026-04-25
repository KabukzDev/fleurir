"use client"; // Required for form handling/buttons

import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for auth goes here
    console.log("Logging in...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" />

      <div className="relative w-full max-w-[400px] bg-mist-950/50 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img className="h-10 mb-2" src="/fleurir/logo_x1.png" alt="Fleurir Logo" />
          <h1 className="text-white text-2xl font-light tracking-tight">Welcome back</h1>
          <p className="text-white/50 text-sm">Log in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="name@example.com"
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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50 transition"
              required
            />
          </div>

          <button 
            type="submit"
            className="cursor-pointer w-full bg-flower-blue hover:bg-flower-blue/90 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] mt-2">
            Log In
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 w-full">
            <div className="h-[1px] bg-white/10 flex-grow" />
            <span className="text-white/30 text-xs uppercase tracking-widest">or</span>
            <div className="h-[1px] bg-white/10 flex-grow" />
          </div>

          <button className="cursor-pointer w-full bg-white text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition">
            {/* You'd put a Google SVG icon here */}
            Continue with Google
          </button>

          <p className="text-white/50 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-flower-blue hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}