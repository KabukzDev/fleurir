import Image from "next/image";
import { getUser } from "@/lib/auth";

// Add authentication verification in order to hide the buttons that give access to the main website. After signing up, show again.

// @/app/components/navbar.tsx
type NavbarProps = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
  } | null;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="relative z-50">
      <div className="w-full flex items-center justify-between px-6 py-3 backdrop-blur-xl bg-mist-950">
        <div className="text-pri-black font-semibold text-lg tracking-tight">
          <a href="/home">
            <img className="h-9" src="/fleurir/logo_x1.png" alt="Fleurir Logo"/>
          </a>
        </div>

        <div className="pr-2 flex items-center gap-6 font-normal text-base">
          {user ? (
            <>
            <a className="text-white hover:text-flower-blue transition" href="/">Home</a>
            <a className="text-white hover:text-flower-blue transition" href="/dashboard">Dashboard</a>
            <a className="text-white hover:text-flower-blue transition" href="/communities">Communities</a>
            <a className="text-white hover:text-flower-blue transition" href="/leagues">Leagues</a>
            <a className="text-white hover:text-flower-blue transition" href="/support">Support</a>
            <div className="group relative flex items-center py-2">
              <img className="h-10 w-10 rounded-full cursor-pointer border border-white/10" src={user.image} alt={user.name} />
              <div className="absolute top-full right-0 mt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-1">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 shadow-2xl">
                  <p className="text-white font-medium text-sm truncate">{user.name}</p>
                  <p className="text-white/50 text-xs truncate mb-3">{user.email}</p>
                  <div className="h-px bg-white/10 my-2" />
                  <a href={`/profile/${user.id}`} className="block text-white/80 hover:text-white text-xs py-1">My Profile</a>
                  <a href="/settings" className="block text-white/80 hover:text-white text-xs py-1">Settings</a>
                  <button className="w-full text-left text-red-400 hover:text-red-300 text-xs py-1 mt-2">
                    Log out
                  </button>
                </div>
              </div>
            </div>
            </>
          ) : (
            <a href="/login" className="rounded-md px-6 py-1 bg-flower-blue text-white transition">
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}