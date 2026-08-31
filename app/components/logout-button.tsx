"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full text-left text-red-400 hover:text-red-300 text-xs py-1 mt-2 cursor-pointer"
    >
      {t("navbar.logout")}
    </button>
  );
}
