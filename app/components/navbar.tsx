"use client";

import NavbarUserMenu from "@/app/components/navbar-user-menu";
import { useTranslation } from "@/lib/i18n/client";

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
  const { t } = useTranslation();

  return (
    <nav className="relative z-50 flex justify-center px-4">
      <div className="w-full flex items-center justify-between px-6 py-3 bg-(--bg-base) transition-all duration-300">
        <div className="font-semibold text-lg tracking-tight">
          <a href="/">
            <img className="h-8 w-auto" src="/fleurir/logo_x1.png" alt="Fleurir Logo"/>
          </a>
        </div>

        <div className="hidden md:flex pr-2 items-center gap-6 font-normal text-base text-(--text-primary)">
          {user ? (
            <>
              <a className="hover:text-flower-blue transition" href="/discover">{t("navbar.discover")}</a>
              <a className="hover:text-flower-blue transition" href="/dashboard">{t("navbar.dashboard")}</a>
              <a className="hover:text-flower-blue transition" href="/leagues">{t("navbar.leagues")}</a>
              <NavbarUserMenu user={user} />
            </>
          ) : (
            <a href="/login" className="rounded-md px-6 py-1 bg-flower-blue text-white transition">
              {t("navbar.login")}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}