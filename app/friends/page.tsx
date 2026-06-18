import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserFriends } from "@/lib/demo-social";

export const metadata = {
  title: "Friends",
};

export default async function FriendsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const friends = await getUserFriends(user.id);

  return (
    <main className="min-h-screen text-white px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-5xl font-light">{user.name}&apos;s friends</h1>
            <p className="text-white/55 mt-2 max-w-2xl">
              People you have worked with across community posts, answers, and
              replies.
            </p>
          </div>

          <Link
            href="/collaborations"
            className="w-fit px-4 py-2 rounded-xl bg-flower-blue hover:bg-flower-blue/90"
          >
            View collaborations
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Friends</p>
            <p className="text-4xl font-light mt-2">{friends.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Shared communities</p>
            <p className="text-4xl font-light mt-2">
              {new Set(friends.flatMap((friend) => friend.sharedCommunitySlugs)).size}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Total shared work</p>
            <p className="text-4xl font-light mt-2">
              {friends.reduce((total, friend) => total + friend.collaborations, 0)}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <article
              key={friend.username}
              className="bg-white/5 border border-white/5 rounded-2xl p-5"
            >
              <div className="flex gap-4">
                <Image
                  src={friend.image}
                  alt={friend.name}
                  width={70}
                  height={70}
                  className="h-[70px] w-[70px] rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl leading-tight">{friend.name}</h2>
                      <p className="text-white/50">@{friend.username}</p>
                    </div>
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-sm capitalize">
                      {friend.role}
                    </span>
                  </div>

                  <p className="text-white/70 mt-3">{friend.bio}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {friend.sharedCommunities.map((community) => (
                      <span
                        key={community}
                        className="rounded-lg bg-white/5 px-2 py-1 text-xs"
                      >
                        {community}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">Shared</p>
                      <p>{friend.collaborations}</p>
                    </div>
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">Points</p>
                      <p>{friend.points}</p>
                    </div>
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">Active</p>
                      <p>{friend.lastActive}</p>
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
