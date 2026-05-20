import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import postsData from "@/data/posts.json";
import {
  getAllUsers,
  getUserContributionStats,
  getUserProfile,
} from "@/lib/demo-social";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

type ActivityItem = {
  id: string;
  communitySlug: string;
  communityName: string;
  postId: string;
  title: string;
  action: string;
  points: number;
  solved: boolean;
};

export async function generateStaticParams() {
  return Object.keys(getAllUsers()).map((username) => ({ username }));
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = getUserProfile(username);

  return {
    title: profile ? profile.name : "Profile",
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = getUserProfile(username);

  if (!profile) notFound();

  const stats = getUserContributionStats(username);
  const recentActivity: ActivityItem[] = [];

  for (const [communitySlug, posts] of Object.entries(postsData.communities)) {
    for (const post of posts) {
      if (post.author === username) {
        recentActivity.push({
          id: `${communitySlug}-${post.id}-post`,
          communitySlug,
          communityName:
            stats.communities.find((community) => community.slug === communitySlug)
              ?.name || communitySlug,
          postId: post.id,
          title: post.title,
          action: "Started a thread",
          points: post.upvotes,
          solved: post.solved,
        });
      }

      for (const comment of post.comments || []) {
        if (comment.author === username) {
          recentActivity.push({
            id: `${communitySlug}-${post.id}-comment-${comment.id}`,
            communitySlug,
            communityName:
              stats.communities.find((community) => community.slug === communitySlug)
                ?.name || communitySlug,
            postId: post.id,
            title: post.title,
            action: comment.accepted ? "Posted accepted answer" : "Joined a thread",
            points: comment.upvotes,
            solved: post.solved,
          });
        }

        for (const reply of comment.replies || []) {
          if (reply.author === username) {
            recentActivity.push({
              id: `${communitySlug}-${post.id}-reply-${reply.id}`,
              communitySlug,
              communityName:
                stats.communities.find((community) => community.slug === communitySlug)
                  ?.name || communitySlug,
              postId: post.id,
              title: post.title,
              action: "Replied in conversation",
              points: 2,
              solved: post.solved,
            });
          }
        }
      }
    }
  }

  recentActivity.sort((a, b) => b.points - a.points);

  return (
    <main className="min-h-screen text-white px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white/5 rounded-3xl p-6 border border-white/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row">
              <Image
                src={profile.image}
                alt={profile.name}
                width={500}
                height={500}
                priority
                className="h-40 w-40 object-cover rounded-full"
              />

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-5xl font-light">{profile.name}</h1>
                  <span className="rounded-xl bg-white/5 px-3 py-1 capitalize">
                    {profile.role}
                  </span>
                </div>
                <p className="text-white/50 mt-1">@{username}</p>
                <p className="text-white/75 mt-4 max-w-2xl">{profile.bio}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-lg bg-white/5 px-2 py-1 text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:w-72">
              <div className="rounded-2xl bg-mist-950/60 px-4 py-3">
                <p className="text-white/45">Points</p>
                <p className="text-2xl">{stats.points}</p>
              </div>
              <div className="rounded-2xl bg-mist-950/60 px-4 py-3">
                <p className="text-white/45">Accepted</p>
                <p className="text-2xl">{stats.acceptedAnswers}</p>
              </div>
              <div className="rounded-2xl bg-mist-950/60 px-4 py-3">
                <p className="text-white/45">Joined</p>
                <p className="text-2xl">{profile.joinedAt}</p>
              </div>
              <div className="rounded-2xl bg-mist-950/60 px-4 py-3">
                <p className="text-white/45">Location</p>
                <p className="truncate">{profile.location}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Threads</p>
            <p className="text-4xl font-light mt-2">{stats.posts}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Comments</p>
            <p className="text-4xl font-light mt-2">{stats.comments}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Replies</p>
            <p className="text-4xl font-light mt-2">{stats.replies}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Communities</p>
            <p className="text-4xl font-light mt-2">{stats.communities.length}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
          <aside className="bg-white/5 rounded-2xl p-5 h-fit">
            <h2 className="text-2xl font-light">Communities</h2>
            <div className="mt-4 space-y-2">
              {stats.communities.map((community) => (
                <Link
                  key={community.slug}
                  href={`/communities/${community.slug}`}
                  className="flex items-center justify-between rounded-xl bg-mist-950/60 px-3 py-2 hover:bg-white/10"
                >
                  <span>
                    {community.symbol} {community.name}
                  </span>
                  <span className="text-white/55">{community.contributions}</span>
                </Link>
              ))}
            </div>
          </aside>

          <section className="space-y-3">
            <h2 className="text-2xl font-light">Recent activity</h2>

            {recentActivity.slice(0, 10).map((activity) => (
              <Link
                key={activity.id}
                href={`/communities/${activity.communitySlug}/forum/${activity.postId}`}
                className="block bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-mist-950/70 px-2 py-1">
                        {activity.communityName}
                      </span>
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-sm">
                        {activity.action}
                      </span>
                      {activity.solved && (
                        <span className="rounded-lg bg-green-500/15 px-2 py-1 text-sm text-green-300">
                          Solved
                        </span>
                      )}
                    </div>
                    <p className="text-xl mt-3">{activity.title}</p>
                  </div>

                  <div className="rounded-xl bg-mist-950/60 px-3 py-2 text-sm md:w-24">
                    <p className="text-white/45">Points</p>
                    <p>{activity.points}</p>
                  </div>
                </div>
              </Link>
            ))}

            {recentActivity.length === 0 && (
              <div className="bg-white/5 rounded-2xl p-8 text-center text-white/50">
                No activity yet.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
