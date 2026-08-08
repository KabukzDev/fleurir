import NavbarUserMenu from "@/app/components/navbar-user-menu";

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
          <a href="/">
            <img className="h-9" src="/fleurir/logo_x1.png" alt="Fleurir Logo"/>
          </a>
        </div>

        <div className="pr-2 flex items-center gap-6 font-normal text-base">
          {user ? (
            <>
              <a className="text-white hover:text-flower-blue transition" href="/discover">Discover</a>
              <a className="text-white hover:text-flower-blue transition" href="/dashboard">Dashboard</a>
              <a className="text-white hover:text-flower-blue transition" href="/leagues">Leagues</a>
              <a className="text-white hover:text-flower-blue transition" href="/support">Support</a>
              <NavbarUserMenu user={user} />
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