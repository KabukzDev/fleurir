"use client";

import { useEffect, useState, useRef } from "react";
import LogoutButton from "@/app/components/logout-button";
import type { FriendRequestItem } from "@/lib/demo-social";
import { useTranslation } from "@/lib/i18n/client";

type NavbarUserMenuProps = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
  };
};

export default function NavbarUserMenu({ user }: NavbarUserMenuProps) {
  const [requests, setRequests] = useState<FriendRequestItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const { t } = useTranslation();
  const navRef = useRef<HTMLDivElement>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/friends/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch {
      // Ignore background fetch errors
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (senderUsername: string) => {
    setLoadingActionId(senderUsername);
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderUsername }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.senderUsername !== senderUsername));
      }
    } catch {
      // Ignore
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDecline = async (senderUsername: string) => {
    setLoadingActionId(senderUsername);
    try {
      const res = await fetch(`/api/friends/requests?senderUsername=${senderUsername}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.senderUsername !== senderUsername));
      }
    } catch {
      // Ignore
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div ref={navRef} className="relative flex items-center gap-3">
      {/* User Profile Avatar & Menu Toggle */}
      <button
        onClick={() => {
          setIsProfileMenuOpen((prev) => !prev);
          setIsNotificationsOpen(false);
        }}
        className="relative cursor-pointer"
      >
        <img
          className="h-10 w-10 rounded-full border border-white/10 object-cover"
          src={user.image}
          alt={user.name}
        />
        {/* Simple, static, non-animated red notification dot */}
        {requests.length > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-mist-950" />
        )}
      </button>

      {/* Notifications Popover Dropdown (Scoped within Navbar, w-80 / sm:w-96) */}
      {isNotificationsOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-mist-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="icon icon-rounded text-flower-blue text-sm">notifications</span>
              <h3 className="text-sm font-semibold text-white">{t("navbar.notifications")}</h3>
            </div>
            {requests.length > 0 && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {requests.length} {t("navbar.newNotifications")}
              </span>
            )}
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-6 space-y-1">
              <p className="text-white/60 text-xs">{t("navbar.noNotifications")}</p>
              <p className="text-white/30 text-[11px]">{t("navbar.notificationsHint")}</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={req.senderImage}
                      alt={req.senderName}
                      className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate text-xs">{req.senderName}</p>
                      <a
                        href={`/profile/${req.senderUsername}`}
                        className="text-flower-blue hover:underline text-[11px] truncate block"
                      >
                        @{req.senderUsername}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAccept(req.senderUsername)}
                      disabled={loadingActionId === req.senderUsername}
                      className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition cursor-pointer text-[11px]"
                    >
                      {t("common.accept")}
                    </button>
                    <button
                      onClick={() => handleDecline(req.senderUsername)}
                      disabled={loadingActionId === req.senderUsername}
                      className="px-2 py-1 bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 rounded-lg transition cursor-pointer text-[11px]"
                    >
                      {t("common.decline")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Profile Dropdown Menu */}
      {isProfileMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-mist-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-50">
          <p className="text-white font-medium text-sm truncate">{user.name}</p>
          <p className="text-white/50 text-xs truncate mb-3">{user.email}</p>

          <div className="h-px bg-white/10 my-2" />

          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              setIsProfileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between text-white/90 hover:text-white text-xs py-2 px-2.5 rounded-xl hover:bg-white/10 transition cursor-pointer mb-1"
          >
            <span className="flex items-center gap-2">
              <span className="icon icon-rounded text-sm">notifications</span>
              {t("navbar.notifications")}
            </span>
            {requests.length > 0 ? (
              <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {requests.length} {t("navbar.newNotifications")}
              </span>
            ) : (
              <span className="text-white/30 text-[10px]">0</span>
            )}
          </button>

          <a
            href={`/profile/${user.id}`}
            className="flex items-center gap-2 text-white/80 hover:text-white text-xs py-2 px-2.5 rounded-xl hover:bg-white/10 transition"
          >
            <span className="icon icon-rounded text-sm">person</span>
            {t("navbar.myProfile")}
          </a>

          <a
            href="/settings"
            className="flex items-center gap-2 text-white/80 hover:text-white text-xs py-2 px-2.5 rounded-xl hover:bg-white/10 transition mb-2"
          >
            <span className="icon icon-rounded text-sm">settings</span>
            {t("navbar.settings")}
          </a>

          <div className="h-px bg-white/10 my-1" />

          <div className="pt-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
