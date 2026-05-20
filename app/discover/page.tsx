import Image from "next/image";
import Link from "next/link";
import postsData from "@/data/posts.json";
import {
  getAllCommunities,
  getAllUsers,
  getUserContributionStats,
} from "@/lib/demo-social";

type DiscoverPageProps = {
  searchParams: Promise<{
    q?: string;
    view?: string;
  }>;
};

const communityDescriptions: Record<string, string> = {
  french: "Practice grammar, pronunciation, and everyday French with learners and mentors.",
  chemistry: "Ask about reactions, bonding, lab habits, and the logic behind chemistry problems.",
  javascript: "Build sharper JavaScript and React instincts through practical project threads.",
  german: "Work through cases, vocabulary, listening, and German sentence patterns.",
  quantum_physics: "Explore quantum concepts, math prep, and careful explanations of tricky ideas.",
  algebra: "Strengthen equations, functions, graphing, and test-ready problem solving.",
  veterinary_medicine: "Discuss animal care, vet-school communication, and practical first-aid basics.",
  medicine: "Study diagnostics, medical-school habits, and clear clinical reasoning basics.",
  philosophy: "Compare ethical theories, reading paths, and arguments with thoughtful peers.",
};

export const metadata = {
  title: "Discover",
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { q = "", view = "all" } = await searchParams;
  const query = q.trim().toLowerCase();
  const users = getAllUsers();
  const communities = getAllCommunities();

  const communityCards = Object.entries(communities)
    .map(([slug, community]) => {
      const posts = postsData.communities[
        slug as keyof typeof postsData.communities
      ] || [];
      const tagSet = new Set<string>();

      for (const post of posts) {
        for (const tag of post.tags) tagSet.add(tag);
      }

      return {
        slug,
        ...community,
        description: communityDescriptions[slug] || "A focused learning community on Fleurir.",
        posts: posts.length,
        solved: posts.filter((post) => post.solved).length,
        tags: [...tagSet].slice(0, 4),
      };
    })
    .filter((community) => {
      if (!query) return true;

      return [
        community.name,
        community.description,
        community.manager,
        ...community.tags,
      ].some((value) => value.toLowerCase().includes(query));
    });

  const peopleCards = Object.entries(users)
    .map(([username, user]) => ({
      username,
      ...user,
      stats: getUserContributionStats(username),
    }))
    .filter((user) => {
      if (!query) return true;

      return [
        user.name,
        user.username,
        user.bio,
        user.location,
        user.role,
        ...user.interests,
        ...user.stats.communities.map((community) => community.name),
      ].some((value) => value.toLowerCase().includes(query));
    })
    .sort((a, b) => b.stats.points - a.stats.points);

  const showCommunities = view === "all" || view === "communities";
  const showPeople = view === "all" || view === "people";

  return (
    <main className="min-h-screen text-white px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 rounded-3xl p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-light">Discover</h1>
              <p className="text-white/55 mt-2 max-w-2xl">
                Find new communities to join and people to learn with across
                Fleurir.
              </p>
            </div>

            <form className="flex flex-col gap-3 sm:flex-row lg:w-140">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search communities or people..."
                className="flex-1 rounded-xl bg-mist-950/70 px-4 py-3 outline-none border border-white/5"
              />
              <input type="hidden" name="view" value={view} />
              <button className="rounded-xl bg-flower-blue px-5 py-3 hover:bg-flower-blue/90">
                Search
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {[
              ["all", "All"],
              ["communities", "Communities"],
              ["people", "People"],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={`/discover?view=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`rounded-xl px-4 py-2 ${
                  view === value ? "bg-flower-blue" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        {showCommunities && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-light">Communities</h2>
              <p className="text-white/45">{communityCards.length} results</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {communityCards.map((community) => (
                <article
                  key={community.slug}
                  className="bg-white/5 rounded-2xl overflow-hidden border border-white/5"
                >
                  <div className="relative h-32">
                    <Image
                      src={community.banner}
                      alt={community.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl">{community.name}</h3>
                        <p className="text-white/50">
                          {community.members.total} members • {community.members.online} online
                        </p>
                      </div>
                      <span className="rounded-xl bg-mist-950/80 px-3 py-2">
                        {community.symbol}
                      </span>
                    </div>

                    <p className="mt-4 text-white/70">{community.description}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {community.tags.map((tag) => (
                        <span
                          key={`${community.slug}-${tag}`}
                          className="rounded-lg bg-white/5 px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                        <p className="text-white/45">Posts</p>
                        <p>{community.posts}</p>
                      </div>
                      <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                        <p className="text-white/45">Solved</p>
                        <p>{community.solved}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/communities/${community.slug}`}
                        className="flex-1 text-center rounded-xl bg-flower-blue px-4 py-2 hover:bg-flower-blue/90"
                      >
                        View community
                      </Link>
                      <Link
                        href={`/communities/${community.slug}/members`}
                        className="flex-1 text-center rounded-xl bg-white/5 px-4 py-2 hover:bg-white/10"
                      >
                        Members
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {showPeople && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-light">People</h2>
              <p className="text-white/45">{peopleCards.length} results</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {peopleCards.map((person) => (
                <article
                  key={person.username}
                  className="bg-white/5 rounded-2xl p-5 border border-white/5"
                >
                  <div className="flex gap-4">
                    <Image
                      src={person.image}
                      alt={person.name}
                      width={100}
                      height={100}
                      className="h-18 w-18 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-2xl">{person.name}</h3>
                          <p className="text-white/50">@{person.username}</p>
                        </div>
                        <span className="rounded-lg bg-white/5 px-2 py-1 text-sm capitalize">
                          {person.role}
                        </span>
                      </div>

                      <p className="mt-3 text-white/70">{person.bio}</p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {person.stats.communities.slice(0, 3).map((community) => (
                          <span
                            key={`${person.username}-${community.slug}`}
                            className="rounded-lg bg-white/5 px-2 py-1 text-xs"
                          >
                            {community.symbol} {community.name}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                        <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                          <p className="text-white/45">Points</p>
                          <p>{person.stats.points}</p>
                        </div>
                        <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                          <p className="text-white/45">Posts</p>
                          <p>{person.stats.posts + person.stats.comments + person.stats.replies}</p>
                        </div>
                        <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                          <p className="text-white/45">Accepted</p>
                          <p>{person.stats.acceptedAnswers}</p>
                        </div>
                      </div>

                      <Link
                        href={`/profile/${person.username}`}
                        className="mt-4 inline-block rounded-xl bg-flower-blue px-4 py-2 hover:bg-flower-blue/90"
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
