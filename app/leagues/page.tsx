import Image from "next/image";
import Link from "next/link";
import { getLeaguesData } from "@/lib/demo-social";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LeaguesPageProps = {
  searchParams: Promise<{ league?: string }>;
};

type League = {
  id: string;
  tier: string;
  name: string;
  threshold: string;
  accent: string;
  banner: string;
};

type LeaderboardEntry = {
  username: string;
  displayName: string;
  image?: string;
  score: number;
  collaborations: number;
  isPromotionZone?: boolean;
  isDemotionZone?: boolean;
};

export const metadata = {
  title: "Leagues | Fleurir",
  description: "Climb the competitive leagues ladder from Bronze to Diamond.",
};

const TIER_ICONS: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  sapphire: "💎",
  ruby: "🔻",
  diamond: "👑",
};

export default async function LeaguesPage({ searchParams }: LeaguesPageProps) {
  const { league } = await searchParams;
  const currentUser = await getUser();
  const leaguesData = await getLeaguesData();

  const leagues = leaguesData.leagues as League[];
  const leaderboards = leaguesData.leaderboards as Record<
    string,
    LeaderboardEntry[]
  >;

  // Find user's active league or default to Gold
  let userActiveLeagueId = "gold";
  if (currentUser) {
    for (const lId in leaderboards) {
      if (leaderboards[lId].some((e) => e.username === currentUser.username)) {
        userActiveLeagueId = lId;
        break;
      }
    }
  }

  const selectedLeague =
    leagues.find((item) => item.id === league) ||
    leagues.find((item) => item.id === userActiveLeagueId) ||
    leagues[0];

  const leaderboard = leaderboards[selectedLeague.id] || [];

  // User's rank in current active league
  const userStandingIndex = currentUser
    ? leaderboard.findIndex((e) => e.username === currentUser.username)
    : -1;
  const userRank = userStandingIndex >= 0 ? userStandingIndex + 1 : null;
  const userEntry = userStandingIndex >= 0 ? leaderboard[userStandingIndex] : null;

  return (
    <main className="min-h-screen text-white px-4 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header & Seasonal Banner */}
      <div className="bg-white/5 rounded-xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: selectedLeague.accent }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{TIER_ICONS[selectedLeague.id] || "🏆"}</span>
              <h1 className="text-3xl md:text-4xl tracking-tight">
                {selectedLeague.tier} League
              </h1>
            </div>
            <p className="text-white/60 text-sm mt-1">
              {selectedLeague.name} • Top 20% promote to the next tier at season end
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 w-fit">
            <span className="text-xl">⏱️</span>
            <div>
              <p className="text-xs text-white/50 font-medium">Season Reset</p>
              <p className="text-sm font-semibold text-flower-blue">
                {leaguesData.season.endsIn}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper League Navigation Bar (Bronze ➔ Diamond) */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
            League Ladder Progression
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {leagues.map((item, index) => {
              const active = item.id === selectedLeague.id;
              const isUserTier = item.id === userActiveLeagueId;

              return (
                <Link
                  key={item.id}
                  href={`/leagues?league=${item.id}`}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 relative ${
                    active
                      ? "bg-white/15 border-white/30 shadow-lg scale-[1.03]"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
                  }`}
                  style={{
                    borderColor: active ? item.accent : undefined,
                  }}
                >
                  {isUserTier && (
                    <span className="absolute -top-2 bg-flower-blue text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full text-black tracking-wider shadow">
                      You
                    </span>
                  )}
                  <span className="text-2xl mb-1">{TIER_ICONS[item.id] || "🏆"}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: item.accent }}
                  >
                    {item.tier}
                  </span>
                  <span className="text-[10px] text-white/40 font-medium">
                    Tier {index + 1}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logged in User Personal Status Card */}
        {userEntry && userRank && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-flower-blue/20 text-flower-blue flex items-center justify-center font-bold text-lg border border-flower-blue/30">
                #{userRank}
              </div>
              <div>
                <p className="font-semibold text-sm">Standing in {selectedLeague.tier} League</p>
                <p className="text-xs text-white/50">
                  {userEntry.isPromotionZone
                    ? "Currently in Promotion Zone! Keep it up to advance."
                    : userEntry.isDemotionZone
                    ? "Currently in Demotion Zone! Earn points to avoid dropping down."
                    : "Safe Zone - You will stay in this league."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-center sm:text-right">
              <div>
                <p className="text-xs text-white/40 font-medium">Total Points</p>
                <p className="text-base font-bold text-flower-blue">{userEntry.score} pts</p>
              </div>
              <div>
                <p className="text-xs text-white/40 font-medium">Collaborations</p>
                <p className="text-base font-bold text-emerald-400">{userEntry.collaborations}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table Section */}
      <section className="bg-white/5 rounded-xl overflow-hidden backdrop-blur-xl shadow-xl">
        {/* Table Header Row */}
        <div className="grid grid-cols-[60px_1fr_120px_140px] items-center px-6 py-4 border-b border-white/10 bg-white/5 text-xs uppercase font-bold tracking-wider text-white/50">
          <span className="text-center">Rank</span>
          <span>User</span>
          <span className="text-center">Total Points</span>
          <span className="text-center">Collaborations</span>
        </div>

        {/* Leaderboard Rows */}
        <div className="divide-y divide-white/5">
          {leaderboard.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/40">
              No participants in this league yet. Be the first to join!
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = currentUser?.username === entry.username;
              const isTop3 = rank <= 3;
              const isPromo = entry.isPromotionZone;
              const isDemo = entry.isDemotionZone;

              return (
                <div
                  key={`${selectedLeague.id}-${entry.username}`}
                  className={`grid grid-cols-[60px_1fr_120px_140px] items-center px-6 py-4 transition-all ${
                    isCurrentUser
                      ? "bg-flower-blue/15 font-medium border-l-4 border-l-flower-blue"
                      : isPromo
                      ? "bg-emerald-500/5 hover:bg-emerald-500/10 border-l-2 border-l-emerald-500/40"
                      : isDemo
                      ? "bg-red-500/5 hover:bg-red-500/10 border-l-2 border-l-red-500/40"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center justify-center">
                    {rank === 1 ? (
                      <span className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center text-sm border border-amber-400/40 shadow">
                        🥇
                      </span>
                    ) : rank === 2 ? (
                      <span className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-200 font-bold flex items-center justify-center text-sm border border-slate-300/40 shadow">
                        🥈
                      </span>
                    ) : rank === 3 ? (
                      <span className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 font-bold flex items-center justify-center text-sm border border-amber-700/40 shadow">
                        🥉
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-white/50">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* User Profile Info */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <div className="relative shrink-0">
                      <Image
                        src={entry.image || "/testing/anna_test.png"}
                        alt={entry.displayName}
                        width={42}
                        height={42}
                        className="rounded-full object-cover h-10 w-10 border-2 border-white/20 shadow-md"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 text-xs"
                        title={`${selectedLeague.tier} League`}
                      >
                        {TIER_ICONS[selectedLeague.id]}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white truncate text-sm">
                          {entry.displayName}
                        </p>
                        {isCurrentUser && (
                          <span className="bg-flower-blue/30 text-flower-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            You
                          </span>
                        )}
                        {isPromo && (
                          <span className="hidden md:inline-flex bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider items-center gap-1">
                            Promotion Zone
                          </span>
                        )}
                        {isDemo && (
                          <span className="hidden md:inline-flex bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider items-center gap-1">
                            Demotion Zone
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 truncate">
                        @{entry.username}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Total Points */}
                  <div className="text-center">
                    <span className="inline-block bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl font-bold text-sm text-flower-blue">
                      {entry.score.toLocaleString()} pts
                    </span>
                  </div>

                  {/* Column 3: Total Collaborations */}
                  <div className="text-center">
                    <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold text-sm text-emerald-400">
                      {entry.collaborations.toLocaleString()} collabs
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
