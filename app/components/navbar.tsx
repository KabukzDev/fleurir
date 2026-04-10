import Image from "next/image";

// Add authentication verification in order to hide the buttons that give access to the main website. After signing up, show again.

export default function Navbar() {
  return (
    <nav>
      <div className="w-full flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-mist-950">
        <div className="text-pri-black font-semibold text-lg tracking-tight">
            <img className="h-9" src="/fleurir/logo_x1.png" alt="Fleurir Logo"/>
        </div>

        <div className="pr-2 flex items-center gap-6 font-normal text-base">
          <a className="text-white hover:text-flower-blue hover:cursor-pointer transition">
            Home
          </a>
          <a className="text-white hover:text-flower-blue hover:cursor-pointer transition">
            Dashboard
          </a>
          <a className="text-white hover:text-flower-blue hover:cursor-pointer transition">
            Support
          </a>
        </div>
      </div>
    </nav>
  );
}