import Image from "next/image";
import Link from "next/link";
import communitiesData from "@/data/communities.json";
import postsData from "@/data/posts.json";
import usersData from "@/data/users.json";

type MembersPageProps = {
  params: Promise<{ slug: string }>;
};

type UserProfile = {
  image: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  points: number;
  joinedAt: string;
  interests: string[];
};

type Member = UserProfile & {
  username: string;
  contributions: number;
  online: boolean;
};

const users = usersData as Record<string, UserProfile>;

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params;
  const community =
    communitiesData[slug as keyof typeof communitiesData];
  const posts =
    postsData.communities[
      slug as keyof typeof postsData.communities
    ] || [];

  if (!community) {
    return <main className="min-h-screen text-white p-10">Community not found</main>;
  }

  const contributionCounts = new Map<string, number>();
  contributionCounts.set(community.manager, 1);

  for (const post of posts) {
    contributionCounts.set(
      post.author,
      (contributionCounts.get(post.author) || 0) + 2
    );

    for (const comment of post.comments || []) {
      contributionCounts.set(
        comment.author,
        (contributionCounts.get(comment.author) || 0) + 1
      );

      for (const reply of comment.replies || []) {
        contributionCounts.set(
          reply.author,
          (contributionCounts.get(reply.author) || 0) + 1
        );
      }
    }
  }

  const members: Member[] = [...contributionCounts.entries()]
    .map(([username, contributions], index) => {
      const profile = users[username] || users.fleurir;

      return {
        ...profile,
        username,
        contributions,
        online: index % 3 !== 1,
      };
    })
    .sort((a, b) => {
      if (a.username === community.manager) return -1;
      if (b.username === community.manager) return 1;

      return b.contributions - a.contributions;
    });

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
                ← Back to {community.name}
              </Link>
              <h1 className="text-5xl font-light mt-3">
                {community.name} members
              </h1>
              <p className="text-white/55 mt-2 max-w-2xl">
                Everyone here has appeared in this community's posts,
                comments, or replies, so the member list mirrors the demo
                conversations.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/communities/${slug}/forum`}
                className="px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10"
              >
                Open forum
              </Link>
              <Link
                href={`/communities/${slug}/forum/ask?type=discussion`}
                className="px-4 py-2 bg-flower-blue rounded-xl hover:bg-flower-blue/90"
              >
                Start discussion
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Active members</p>
            <p className="text-4xl font-light mt-2">{members.length}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Online now</p>
            <p className="text-4xl font-light mt-2">
              {members.filter((member) => member.online).length}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Thread contributions</p>
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
                <div className="relative h-16 w-16 shrink-0">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                  <span
                    className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-mist-950 ${
                      member.online ? "bg-green-400" : "bg-white/25"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl">{member.name}</h2>
                      <p className="text-white/50">@{member.username}</p>
                    </div>
                    <span className="capitalize text-xs bg-white/5 px-2 py-1 rounded-lg">
                      {member.username === community.manager
                        ? "manager"
                        : member.role}
                    </span>
                  </div>

                  <p className="mt-3 text-white/75">{member.bio}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.interests.slice(0, 4).map((interest) => (
                      <span
                        key={interest}
                        className="text-xs px-2 py-1 bg-white/5 rounded-lg"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">Points</p>
                      <p>{member.points}</p>
                    </div>
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">Posts</p>
                      <p>{member.contributions}</p>
                    </div>
                    <div className="bg-mist-950/60 rounded-xl px-3 py-2">
                      <p className="text-white/45">Status</p>
                      <p>{member.online ? "Online" : "Away"}</p>
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
