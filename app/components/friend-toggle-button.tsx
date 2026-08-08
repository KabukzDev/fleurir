"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FriendshipStatus } from "@/lib/demo-social";

type FriendToggleButtonProps = {
  friendUsername: string;
  initialStatus?: FriendshipStatus;
  initialIsFriend?: boolean;
};

export default function FriendToggleButton({
  friendUsername,
  initialStatus,
  initialIsFriend,
}: FriendToggleButtonProps) {
  const router = useRouter();

  const defaultStatus: FriendshipStatus = initialStatus
    ? initialStatus
    : initialIsFriend
    ? "accepted"
    : "none";

  const [status, setStatus] = useState<FriendshipStatus>(defaultStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);

    try {
      if (status === "accepted" || status === "pending_sent") {
        // Cancel or Remove
        const res = await fetch(`/api/friends?friendUsername=${friendUsername}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setStatus("none");
          router.refresh();
        }
      } else if (status === "pending_received") {
        // Accept incoming request
        const res = await fetch("/api/friends/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderUsername: friendUsername }),
        });
        if (res.ok) {
          setStatus("accepted");
          router.refresh();
        }
      } else {
        // Send request
        const res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendUsername }),
        });
        if (res.ok) {
          setStatus("pending_sent");
          router.refresh();
        }
      }
    } catch {
      // Ignore errors silently
    } finally {
      setLoading(false);
    }
  };

  let label = "+ Add Friend";
  let buttonStyle = "bg-flower-blue hover:bg-flower-blue/90 text-white";

  if (loading) {
    label = "Updating...";
  } else if (status === "accepted") {
    label = "Friends ✓";
    buttonStyle = "bg-green-500/20 hover:bg-red-500/20 text-green-300 hover:text-red-300 border border-green-500/20 transition";
  } else if (status === "pending_sent") {
    label = "Request Sent";
    buttonStyle = "bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/10 transition";
  } else if (status === "pending_received") {
    label = "Accept Request";
    buttonStyle = "bg-green-600 hover:bg-green-700 text-white font-semibold transition";
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${buttonStyle}`}
    >
      {label}
    </button>
  );
}
