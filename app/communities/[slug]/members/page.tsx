import Image from "next/image";
import Link from "next/link";
import { getCommunity, getCommunityMembers } from "@/lib/demo-social";
import { getLocale, getDictionary } from "@/lib/i18n/server";

type MembersPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MembersPage({ params }: MembersPageProps) {
  const [{ slug }, locale] = await Promise.all([
    params,
    getLocale(),
  ]);

  const dict = getDictionary(locale);
  const [community, members] = await Promise.all([
    getCommunity(slug),
    getCommunityMembers(slug),
  ]);

  if (!community) {
    return <main className="min-h-screen text-white p-10">{locale === "es" ? "Comunidad no encontrada" : "Community not found"}</main>;
  }

  return (
    <main className="min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 rounded-3xl overflow-hidden">
          <div className="relative h-44 w-full">
            <Image
              src={community.banner}
              alt={community.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href={`/communities/${slug}`}
                className="text-white/50 hover:text-white"
              >
                ← {locale === "es" ? `Volver a ${community.name}` : `Back to ${community.name}`}
              </Link>
              <h1 className="text-5xl font-light mt-3">
                {locale === "es" ? `Miembros de ${community.name}` : `${community.name} members`}
              </h1>
              <p className="text-white/55 mt-2 max-w-2xl">
                {locale === "es" ? "Miembros que participan en publicaciones, comentarios y respuestas de esta comunidad." : "Members are derived from this community's manager, post authors, commenters, and reply authors."}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/communities/${slug}/forum`}
                className="px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10"
              >
                {locale === "es" ? "Abrir foro" : "Open forum"}
              </Link>
              <Link
                href={`/communities/${slug}/forum/ask?type=discussion`}
                className="px-4 py-2 bg-flower-blue rounded-xl hover:bg-flower-blue/90"
              >
                {dict.forum.newDiscussionTitle}
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{dict.discover.activeMembers}</p>
            <p className="text-4xl font-light mt-2">{members.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{dict.common.online}</p>
            <p className="text-4xl font-light mt-2">
              {members.filter((member) => member.isOnline).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{dict.communities.contributions}</p>
            <p className="text-4xl font-light mt-2">
              {members.reduce((total, member) => total + member.contributions, 0)}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {members.map((member) => (
            <article
              key={member.username}
              className="bg-white/5 rounded-2xl p-5 border border-white/5"
            >
              <div className="flex gap-4">
                <Link
                  href={`/profile/${member.username}`}
                  className="relative h-16 w-16 shrink-0"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/profile/${member.username}`}
                        className="text-2xl leading-tight hover:underline"
                      >
                        {member.name}
                      </Link>
                      <p className="text-white/50">@{member.username}</p>
                    </div>

                    <span className="rounded-lg bg-white/5 px-2 py-1 text-sm capitalize">
                      {member.role}
                    </span>
                  </div>

                  <p className="mt-3 text-white/70">{member.bio}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">{dict.common.points}</p>
                      <p>{member.points}</p>
                    </div>
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">{dict.communities.contributions}</p>
                      <p>{member.contributions}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
