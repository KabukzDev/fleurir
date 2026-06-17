import Link from "next/link";
import { getAnnaCollaborations, getAnnaFriends } from "@/lib/demo-social";

export const metadata = {
  title: "Collaborations",
};

const actionLabels = {
  asked: "Started thread",
  answered: "Answered",
  replied: "Replied",
};

export default async function CollaborationsPage() {
  const [collaborations, friends] = await Promise.all([
    getAnnaCollaborations(),
    getAnnaFriends(),
  ]);
  const totalPoints = collaborations.reduce(
    (total, collaboration) => total + collaboration.points,
    0
  );

  return (
    <main className="min-h-screen text-white px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-5xl font-light">Global collaborations</h1>
            <p className="text-white/55 mt-2 max-w-2xl">
              All community threads where Anna has posted, answered, or joined
              the conversation.
            </p>
          </div>

          <Link
            href="/friends"
            className="w-fit px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10"
          >
            View friends
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Collaborations</p>
            <p className="text-4xl font-light mt-2">{collaborations.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Points earned</p>
            <p className="text-4xl font-light mt-2">{totalPoints}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Communities</p>
            <p className="text-4xl font-light mt-2">
              {new Set(collaborations.map((item) => item.communitySlug)).size}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Collaborators</p>
            <p className="text-4xl font-light mt-2">{friends.length}</p>
          </div>
        </section>

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
                      {actionLabels[collaboration.action]}
                    </span>
                    {collaboration.solved && (
                      <span className="rounded-lg bg-green-500/15 text-green-300 px-2 py-1 text-sm">
                        Solved
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl mt-3">{collaboration.postTitle}</h2>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {collaboration.tags.map((tag) => (
                      <span
                        key={`${collaboration.id}-${tag}`}
                        className="rounded-lg bg-white/5 px-2 py-1 text-xs text-white/65"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:w-56 text-sm">
                  <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                    <p className="text-white/45">Points</p>
                    <p>{collaboration.points}</p>
                  </div>
                  <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                    <p className="text-white/45">People</p>
                    <p>{collaboration.collaboratorUsernames.length}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
