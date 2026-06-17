import Image from "next/image";
import Link from "next/link";
import { getLeaguesData } from "@/lib/demo-social";

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
};

export const metadata = {
  title: "Leagues",
};

export default async function LeaguesPage({ searchParams }: LeaguesPageProps) {
  const { league } = await searchParams;
  const leaguesData = await getLeaguesData();
  const leagues = leaguesData.leagues as League[];
  const leaderboards = leaguesData.leaderboards as Record<
    string,
    LeaderboardEntry[]
  >;
  const selectedLeague =
    leagues.find((item) => item.id === league) ||
    leagues.find((item) => item.id === leaguesData.currentLeagueId) ||
    leagues[0];
  const leaderboard = leaderboards[selectedLeague.id] || [];

  return (
    <main className="min-h-screen text-white px-4 py-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        <aside className="bg-white/5 rounded-xl overflow-hidden h-fit">
          <div className="px-4 py-3">
            <h1 className="text-lg">{leaguesData.season.name}</h1>
            <p className="text-white/45 text-sm">
              Resets in {leaguesData.season.endsIn}
            </p>
          </div>

          <nav>
            {leagues.map((item) => {
              const active = item.id === selectedLeague.id;

              return (
                <Link
                  key={item.id}
                  href={`/leagues?league=${item.id}`}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 transition ${
                    active ? "bg-white/15" : "odd:bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span
                    className="rounded-md px-2 py-1 text-sm bg-black/35"
                    style={{ color: item.accent }}
                  >
                    {item.tier}
                  </span>
                  <span>{item.name}</span>
                  <span className="rounded-md bg-black/35 px-2 py-1 text-sm">
                    {item.threshold}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="bg-white/5 rounded-xl overflow-hidden">
          <div className="relative h-36 md:h-44">
            <Image
              src={selectedLeague.banner}
              alt={`${selectedLeague.name} league banner`}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,13,15,0.35),rgba(10,13,15,0.05),rgba(10,13,15,0.35))]" />
          </div>

          <div className="bg-mist-950/70">
            <div className="px-5 md:px-10 py-5 text-center border-b border-white/5">
              <h2 className="text-4xl md:text-5xl font-light">
                {selectedLeague.tier} {selectedLeague.name} League
              </h2>
              <p className="text-white/60 mt-2">
                Top {selectedLeague.threshold} of seasonal collaborators
              </p>
            </div>

            <div className="px-4 md:px-7 py-3 text-center bg-white/5">
              <p>Leaderboard</p>
            </div>

            <div>
              {leaderboard.map((entry, index) => {
                const image = entry.image || "/testing/anna_test.png";

                return (
                  <div
                    key={`${selectedLeague.id}-${entry.username}`}
                    className={`grid grid-cols-[54px_1fr_100px_100px] items-center gap-3 px-4 py-3 ${
                      index % 2 === 0 ? "bg-white/8" : "bg-white/3"
                    }`}
                  >
                    <span className="justify-self-center rounded-md bg-black/45 px-2 py-1">
                      #{index + 1}
                    </span>

                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={image}
                        alt={entry.displayName}
                        width={34}
                        height={34}
                        className="rounded-full object-cover h-9 w-9 border border-white/30"
                      />
                      <div className="min-w-0">
                        <p className="truncate">{entry.displayName}</p>
                        <p className="text-xs text-white/35 truncate">
                          @{entry.username}
                        </p>
                      </div>
                    </div>

                    <div className="border-l border-r border-white/70 text-center">
                      <span className="rounded-md bg-black/35 px-2 py-1">
                        {entry.score}
                      </span>
                    </div>

                    <div className="border-r border-white/70 text-center">
                      <span className="rounded-md bg-black/35 px-2 py-1">
                        {entry.collaborations}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
