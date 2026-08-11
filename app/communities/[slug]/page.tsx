import Image from "next/image";
import Link from "next/link";
import Card from "@/app/components/card";
import CommunityJoinButton from "@/app/components/community-join-button";
import { getAllCommunities, getCommunity, isUserCommunityMember } from "@/lib/demo-social";
import { getUser } from "@/lib/auth";

type CommunityPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CommunityPage({
  params,
}: CommunityPageProps) {
  const { slug } = await params;

  const [community, communities, user] = await Promise.all([
    getCommunity(slug),
    getAllCommunities(),
    getUser(),
  ]);

  if (!community) {
    return <div className="text-white p-10">Community not found</div>;
  }

  const isJoined = user ? await isUserCommunityMember(slug, user.id) : false;

  const cards = [
    {
      id: 1,
      icon: "forum",
      title: "Forum",
      members: `${community.members.online}`,
      img: "...",
      link: `/communities/${slug}/forum`,
    },
    {
      id: 2,
      icon: "group",
      title: "Members",
      members: `${community.members.total}`,
      img: "...",
      link: `/communities/${slug}/members`,
    },
  ];

  return (
    <main className="min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto flex gap-6">

        <aside className="w-90 bg-white/5 rounded-3xl p-4 h-fit">
          <h2 className="leading-none tracking-tight font-medium text-2xl text-flower-blue mx-2 mt-2 mb-4">
            Communities
          </h2>

          <div className="space-y-2">
            {communities.map((item) => (
              <Link
                key={item.slug}
                href={`/communities/${item.slug}`}
                className={`flex justify-between items-center px-3 py-2 rounded-xl transition ${
                  item.slug === slug
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div>
                  <span className="bg-mist-950/60 rounded-lg px-2 py-1">
                    {item.symbol}
                  </span>
                  <span className="px-2">{item.name}</span>
                </div>

                <div className="bg-mist-950/60 rounded-lg px-2 py-1">
                  {item.members.total}
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-white/4 rounded-3xl overflow-hidden">
          <div className="relative h-56 w-full">
            <Image
              src={community.banner}
              alt={community.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-6xl font-light">{community.name}</h1>
                <p className="text-white/60">
                  Managed by <a className="underline font-medium hover:text-flower-blue" href={`/profile/${community.manager.toLowerCase()}`}>@{community.manager}</a>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {user && (
                  <CommunityJoinButton slug={slug} initialJoined={isJoined} />
                )}

                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-2 text-center flex items-center gap-1">
                    <span className="text-white icon icon-rounded icon-filled icon-24">group</span>
                    <p className="text-white leading-none tracking-tight text-xl">{community.members.total}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {cards.map((item) => (
                <Card
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  memberCount={item.members}
                  bgImage={item.img}
                  link={item.link}
                />
              ))}
              </div>
              <div className="bg-white/4 rounded-2xl mt-4 p-5 flex flex-row justify-between">
                <div className="flex flex-col justify-between items-start w-full">
                  <p className="leading-none tracking-tight font-medium text-2xl pb-4">
                    Community Profile
                  </p>
                  <div className="space-y-2 text-m w-full">
                    <div className="bg-mist-950/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center flex justify-between w-full">
                      <span>Points</span>
                      <span className="text-flower-blue">{community.profile?.points || 0}</span>
                    </div>
                    <div className="bg-mist-950/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center flex justify-between w-full">
                      <span>Contributions</span>
                      <span className="text-flower-blue">{community.profile?.contributions || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end gap-4 w-full">
                  <Link
                    href={`/communities/${slug}/forum/ask?type=question`}
                    className="w-fit px-5 border border-white/20 rounded-xl py-2 hover:bg-white/5 cursor-pointer"
                  >
                    Start contribution
                  </Link>
                  <Link
                    href={`/communities/${slug}/forum/ask?type=discussion`}
                    className="w-fit px-5 border border-white/20 rounded-xl py-2 hover:bg-white/5 cursor-pointer"
                  >
                    Start discussion
                  </Link>
                </div>
              </div>
            </div>
        </section>
      </div>
    </main>
  );
}
