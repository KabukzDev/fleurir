import Image from "next/image";
import Link from "next/link";
import {
  getAllCommunities,
  getAllUsers,
  getUserContributionStats,
  getForumPosts,
} from "@/lib/demo-social";
import { getLocale, getDictionary } from "@/lib/i18n/server";

type DiscoverPageProps = {
  searchParams: Promise<{
    q?: string;
    view?: string;
  }>;
};

const communityDescriptions: Record<string, { en: string; es: string }> = {
  french: {
    en: "Practice grammar, pronunciation, and everyday French with learners and mentors.",
    es: "Practica gramática, pronunciación y francés cotidiano con estudiantes y mentores.",
  },
  chemistry: {
    en: "Ask about reactions, bonding, lab habits, and the logic behind chemistry problems.",
    es: "Pregunta sobre reacciones, enlaces, hábitos de laboratorio y la lógica de la química.",
  },
  javascript: {
    en: "Build sharper JavaScript and React instincts through practical project threads.",
    es: "Mejora tus habilidades en JavaScript y React mediante proyectos prácticos.",
  },
  german: {
    en: "Work through cases, vocabulary, listening, and German sentence patterns.",
    es: "Aprende casos, vocabulario, comprensión auditiva y oraciones en alemán.",
  },
  quantum_physics: {
    en: "Explore quantum concepts, math prep, and careful explanations of tricky ideas.",
    es: "Explora conceptos cuánticos, preparación matemática y explicaciones claras.",
  },
  algebra: {
    en: "Strengthen equations, functions, graphing, and test-ready problem solving.",
    es: "Refuerza ecuaciones, funciones, gráficas y resolución de problemas.",
  },
  veterinary_medicine: {
    en: "Discuss animal care, vet-school communication, and practical first-aid basics.",
    es: "Conversa sobre cuidado animal, formación veterinaria y primeros auxilios.",
  },
  medicine: {
    en: "Study diagnostics, medical-school habits, and clear clinical reasoning basics.",
    es: "Estudia diagnósticos, hábitos de estudio médico y razonamiento clínico.",
  },
  philosophy: {
    en: "Compare ethical theories, reading paths, and arguments with thoughtful peers.",
    es: "Compara teorías éticas, lecturas y argumentos con otros estudiantes.",
  },
};

export const metadata = {
  title: "Discover",
};

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const [{ q = "", view = "all" }, locale] = await Promise.all([
    searchParams,
    getLocale(),
  ]);

  const dict = getDictionary(locale);
  const query = q.trim().toLowerCase();
  const cleanQuery = query.replace(/^@/, "").trim();
  const [users, communities, allPosts] = await Promise.all([
    getAllUsers(),
    getAllCommunities(),
    getForumPosts(),
  ]);

  const communityCards = communities
    .map((community) => {
      const posts = allPosts.filter((post) => post.communitySlug === community.slug);
      const tagSet = new Set<string>();

      for (const post of posts) {
        for (const tag of post.tags) tagSet.add(tag);
      }

      const descMap = communityDescriptions[community.slug];
      const localizedDesc = descMap ? descMap[locale] : (community.description || "A focused learning community on Fleurir.");

      return {
        ...community,
        description: localizedDesc,
        posts: posts.length,
        solved: posts.filter((post) => post.solved).length,
        tags: [...tagSet].slice(0, 4),
      };
    })
    .filter((community) => {
      if (!query) return true;

      const searchableStrings = [
        community.name,
        community.slug,
        community.description,
        community.manager,
        `@${community.manager}`,
        ...community.tags,
      ];

      return searchableStrings.some((value) => {
        const val = value.toLowerCase();
        return val.includes(query) || (cleanQuery ? val.includes(cleanQuery) : false);
      });
    });

  const statsByUsername = new Map(
    await Promise.all(
      users.map(async (user) => [
        user.username,
        await getUserContributionStats(user.username),
      ] as const)
    )
  );

  const peopleCards = users
    .map((user) => ({
      ...user,
      stats: statsByUsername.get(user.username)!,
    }))
    .filter((user) => {
      if (!query) return true;

      const searchableStrings = [
        user.name,
        user.username,
        `@${user.username}`,
        user.bio,
        user.location,
        user.role,
        ...user.interests,
        ...user.stats.communities.map((community) => community.name),
      ];

      return searchableStrings.some((value) => {
        const val = value.toLowerCase();
        return val.includes(query) || (cleanQuery ? val.includes(cleanQuery) : false);
      });
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
              <h1 className="text-5xl font-light">{dict.discover.title}</h1>
              <p className="text-white/55 mt-2 max-w-2xl">
                {dict.discover.subtitle}
              </p>
            </div>

            <form className="flex flex-col gap-3 sm:flex-row lg:w-140">
              <input
                name="q"
                defaultValue={q}
                placeholder={dict.discover.searchPlaceholder}
                className="flex-1 rounded-xl bg-mist-950/70 px-4 py-3 outline-none border border-white/5"
              />
              <input type="hidden" name="view" value={view} />
              <button className="rounded-xl bg-flower-blue px-5 py-3 hover:bg-flower-blue/90 cursor-pointer">
                {dict.common.search}
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {[
              ["all", locale === "es" ? "Todo" : "All"],
              ["communities", locale === "es" ? "Comunidades" : "Communities"],
              ["people", locale === "es" ? "Personas" : "People"],
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
              <h2 className="text-3xl font-light">{dict.communities.title}</h2>
              <p className="text-white/45">{communityCards.length} {locale === "es" ? "resultados" : "results"}</p>
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
                          {community.members.total} {dict.common.members} • {community.members.online} {dict.common.online}
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
                        <p className="text-white/45">{dict.communities.allDiscussions}</p>
                        <p>{community.posts}</p>
                      </div>
                      <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                        <p className="text-white/45">{dict.common.solved}</p>
                        <p>{community.solved}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/communities/${community.slug}`}
                        className="flex-1 text-center rounded-xl bg-flower-blue px-4 py-2 hover:bg-flower-blue/90"
                      >
                        {dict.discover.viewCommunity}
                      </Link>
                      <Link
                        href={`/communities/${community.slug}/members`}
                        className="flex-1 text-center rounded-xl bg-white/5 px-4 py-2 hover:bg-white/10"
                      >
                        {dict.communities.membersTab}
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
              <h2 className="text-3xl font-light">{locale === "es" ? "Personas" : "People"}</h2>
              <p className="text-white/45">{peopleCards.length} {locale === "es" ? "resultados" : "results"}</p>
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
                          <p className="text-white/45">{dict.common.points}</p>
                          <p>{person.stats.points}</p>
                        </div>
                        <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                          <p className="text-white/45">{dict.common.collabs}</p>
                          <p>{person.stats.posts + person.stats.comments + person.stats.replies}</p>
                        </div>
                        <div className="rounded-xl bg-mist-950/60 px-3 py-2">
                          <p className="text-white/45">{dict.common.solved}</p>
                          <p>{person.stats.acceptedAnswers}</p>
                        </div>
                      </div>

                      <Link
                        href={`/profile/${person.username}`}
                        className="mt-4 inline-block rounded-xl bg-flower-blue px-4 py-2 hover:bg-flower-blue/90"
                      >
                        {dict.navbar.myProfile}
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
