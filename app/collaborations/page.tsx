import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserCollaborations, getUserFriends } from "@/lib/demo-social";
import { getLocale, getDictionary } from "@/lib/i18n/server";

export const metadata = {
  title: "Collaborations",
};

export default async function CollaborationsPage() {
  const [user, locale] = await Promise.all([
    getUser(),
    getLocale(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const dict = getDictionary(locale);
  const [collaborations, friends] = await Promise.all([
    getUserCollaborations(user.id),
    getUserFriends(user.id),
  ]);
  const totalPoints = collaborations.reduce(
    (total, collaboration) => total + collaboration.points,
    0
  );

  const actionLabels: Record<string, string> = {
    asked: locale === "es" ? "Inició publicación" : "Started thread",
    answered: locale === "es" ? "Respondió" : "Answered",
    replied: locale === "es" ? "Comentó" : "Replied",
  };

  return (
    <main className="min-h-screen text-white px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-5xl font-light">{dict.collaborations.title}</h1>
            <p className="text-white/55 mt-2 max-w-2xl">
              {dict.collaborations.subtitle}
            </p>
          </div>

          <Link
            href="/friends"
            className="w-fit px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
          >
            {dict.friends.title}
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{dict.collaborations.title}</p>
            <p className="text-4xl font-light mt-2">{collaborations.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{locale === "es" ? "Puntos ganados" : "Points earned"}</p>
            <p className="text-4xl font-light mt-2">{totalPoints}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{dict.communities.title}</p>
            <p className="text-4xl font-light mt-2">
              {new Set(collaborations.map((item) => item.communitySlug)).size}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{locale === "es" ? "Colaboradores" : "Collaborators"}</p>
            <p className="text-4xl font-light mt-2">{friends.length}</p>
          </div>
        </section>

        {collaborations.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center text-white/50">
            {dict.collaborations.noCollaborations}
          </div>
        ) : (
          <section className="space-y-3">
            {collaborations.map((collaboration) => (
              <Link
                key={collaboration.id}
                href={`/communities/${collaboration.communitySlug}/forum/${collaboration.postId}`}
                className="block bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-mist-950/70 px-2 py-1">
                        {collaboration.communitySymbol} {collaboration.communityName}
                      </span>
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-sm">
                        {actionLabels[collaboration.action] || collaboration.action}
                      </span>
                      {collaboration.solved && (
                        <span className="rounded-lg bg-green-500/15 text-green-300 px-2 py-1 text-sm">
                          {dict.common.solved}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl mt-3">{collaboration.postTitle}</h2>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {collaboration.tags.map((tag) => (
                        <span
                          key={`${collaboration.id}-${tag}`}
                          className="rounded-lg bg-white/5 px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className="text-sm font-semibold text-flower-blue">
                      +{collaboration.points} {dict.common.pts}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
