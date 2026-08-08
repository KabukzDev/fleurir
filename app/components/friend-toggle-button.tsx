"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FriendToggleButtonProps = {
  friendUsername: string;
  initialIsFriend: boolean;
};

export default function FriendToggleButton({
  friendUsername,
  initialIsFriend,
}: FriendToggleButtonProps) {
  const router = useRouter();
  const [isFriend, setIsFriend] = useState(initialIsFriend);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    if (isFriend) {
      const res = await fetch(`/api/friends?friendUsername=${friendUsername}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsFriend(false);
        router.refresh();
      }
    } else {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendUsername }),
      });
      if (res.ok) {
        setIsFriend(true);
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
        isFriend
          ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/20"
          : "bg-flower-blue hover:bg-flower-blue/90 text-white"
      }`}
    >
      {loading ? "Updating..." : isFriend ? "Remove Friend" : "+ Add Friend"}
    </button>
  );
}
