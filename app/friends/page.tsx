import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserFriends } from "@/lib/demo-social";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import FriendToggleButton from "@/app/components/friend-toggle-button";

export const metadata = {
  title: "Friends",
};

export default async function FriendsPage() {
  const [user, locale] = await Promise.all([
    getUser(),
    getLocale(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const dict = getDictionary(locale);
  const friends = await getUserFriends(user.id);

  return (
    <main className="min-h-screen text-white px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-5xl font-light">
              {locale === "es" ? `Amigos de ${user.name}` : `${user.name}'s friends`}
            </h1>
            <p className="text-white/55 mt-2 max-w-2xl">
              {dict.friends.subtitle}
            </p>
          </div>

          <Link
            href="/discover"
            className="w-fit px-4 py-2 rounded-xl bg-flower-blue hover:bg-flower-blue/90 text-white cursor-pointer"
          >
            {dict.friends.addFriend}
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">{dict.friends.title}</p>
            <p className="text-4xl font-light mt-2">{friends.length}</p>
          </div>
        </section>

        {friends.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-8 text-center text-white/50">
            {dict.friends.noFriends}
          </div>
        ) : (
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
                        <Link
                          href={`/profile/${friend.username}`}
                          className="text-2xl leading-tight hover:underline"
                        >
                          {friend.name}
                        </Link>
                        <p className="text-white/50">@{friend.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-white/5 px-2 py-1 text-sm capitalize">
                          {friend.role}
                        </span>
                        <FriendToggleButton
                          friendUsername={friend.username}
                          initialIsFriend={true}
                        />
                      </div>
                    </div>

                    <p className="text-white/70 mt-3">{friend.bio}</p>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                        <p className="text-white/45">{dict.common.points}</p>
                        <p>{friend.points}</p>
                      </div>
                      <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                        <p className="text-white/45">{dict.friends.lastActive}</p>
                        <p>{friend.lastActive}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
