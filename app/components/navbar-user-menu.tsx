"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/app/components/logout-button";
import type { FriendRequestItem } from "@/lib/demo-social";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

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
    <>
      <div className="group relative flex items-center py-2">
        <div className="relative">
          <img
            className="h-10 w-10 rounded-full cursor-pointer border border-white/10 object-cover"
            src={user.image}
            alt={user.name}
          />
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-mist-950 animate-pulse">
              {requests.length}
            </span>
          )}
        </div>

        {/* Profile Dropdown Menu */}
        <div className="absolute top-full right-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-1 z-50">
          <div className="bg-mist-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
            <p className="text-white font-medium text-sm truncate">{user.name}</p>
            <p className="text-white/50 text-xs truncate mb-3">{user.email}</p>
            
            <div className="h-px bg-white/10 my-2" />

            {/* Notification button in hover menu */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between text-white/90 hover:text-white text-xs py-2 px-2.5 rounded-xl hover:bg-white/10 transition cursor-pointer mb-1"
            >
              <span className="flex items-center gap-2">
                <span className="icon icon-rounded text-sm">notifications</span>
                Notifications
              </span>
              {requests.length > 0 ? (
                <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {requests.length} new
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
              My Profile
            </a>

            <a
              href="/settings"
              className="flex items-center gap-2 text-white/80 hover:text-white text-xs py-2 px-2.5 rounded-xl hover:bg-white/10 transition mb-2"
            >
              <span className="icon icon-rounded text-sm">settings</span>
              Settings
            </a>

            <div className="h-px bg-white/10 my-1" />

            <div className="pt-1">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Friend Requests Notifications Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#181a1e] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="icon icon-rounded text-flower-blue">notifications</span>
                <h3 className="text-xl font-medium text-white">Friend Requests</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white text-xl p-1 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-4xl block text-white/20">🔔</span>
                <p className="text-white/60 text-sm">No pending friend requests.</p>
                <p className="text-white/30 text-xs">When members send you friend requests, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={req.senderImage}
                        alt={req.senderName}
                        className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{req.senderName}</p>
                        <a
                          href={`/profile/${req.senderUsername}`}
                          className="text-flower-blue hover:underline text-xs truncate block"
                        >
                          @{req.senderUsername}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAccept(req.senderUsername)}
                        disabled={loadingActionId === req.senderUsername}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.senderUsername)}
                        disabled={loadingActionId === req.senderUsername}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 rounded-xl text-xs transition cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
