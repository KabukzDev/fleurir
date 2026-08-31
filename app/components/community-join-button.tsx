"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

type CommunityJoinButtonProps = {
  slug: string;
  initialJoined: boolean;
};

export default function CommunityJoinButton({
  slug,
  initialJoined,
}: CommunityJoinButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [joined, setJoined] = useState(initialJoined);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    if (joined) {
      const res = await fetch(`/api/communities/join?communitySlug=${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setJoined(false);
        router.refresh();
      }
    } else {
      const res = await fetch("/api/communities/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communitySlug: slug }),
      });
      if (res.ok) {
        setJoined(true);
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-1.5 rounded-xl font-medium transition cursor-pointer ${
        joined
          ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
          : "bg-flower-blue hover:bg-flower-blue/90 text-white"
      }`}
    >
      {loading ? t("common.saving") : joined ? t("communities.leaveCommunity") : t("communities.joinCommunity")}
    </button>
  );
}
