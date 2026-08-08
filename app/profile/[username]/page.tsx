import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getUserContributionStats,
  getUserCollaborations,
  getUserProfile,
  getFriendshipStatus,
} from "@/lib/demo-social";
import { getUser } from "@/lib/auth";
import FriendToggleButton from "@/app/components/friend-toggle-button";

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

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getUserProfile(username);

  return {
    title: profile ? profile.name : "Profile",
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [profile, currentUser] = await Promise.all([
    getUserProfile(username),
    getUser(),
  ]);

  if (!profile) notFound();

  const isCurrentUsersOwnProfile = currentUser?.id === username;
  const friendshipStatus = currentUser && !isCurrentUsersOwnProfile
    ? await getFriendshipStatus(currentUser.id, username)
    : "none";

  const [stats, collaborations] = await Promise.all([
    getUserContributionStats(username),
    getUserCollaborations(username),
  ]);
  const recentActivity: ActivityItem[] = collaborations.map((collaboration) => ({
    id: collaboration.id,
    communitySlug: collaboration.communitySlug,
    communityName: collaboration.communityName,
    postId: collaboration.postId,
    title: collaboration.postTitle,
    action:
      collaboration.action === "asked"
        ? "Started a thread"
        : collaboration.action === "answered"
          ? "Joined a thread"
          : "Replied in conversation",
    points: collaboration.points,
    solved: collaboration.solved,
  }));

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
                  {currentUser && !isCurrentUsersOwnProfile && (
                    <FriendToggleButton
                      friendUsername={username}
                      initialStatus={friendshipStatus}
                    />
                  )}
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
                <p className="text-2xl">{profile.points}</p>
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
                <p className="wrap">{profile.location}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/50">Posts</p>
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
            <p className="text-white/50">Accepted Answers</p>
            <p className="text-4xl font-light mt-2">{stats.acceptedAnswers}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-3xl p-6">
            <h2 className="text-2xl font-light mb-4">Activity Timeline</h2>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white/5 rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs bg-white/10 rounded px-2 py-0.5 text-white/70">
                      {activity.communityName}
                    </span>
                    <h3 className="text-lg mt-1 font-normal">
                      <Link
                        href={`/communities/${activity.communitySlug}/forum/${activity.postId}`}
                        className="hover:underline"
                      >
                        {activity.title}
                      </Link>
                    </h3>
                    <p className="text-white/50 text-sm">{activity.action}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-flower-blue font-medium">
                      +{activity.points} pts
                    </span>
                    {activity.solved && (
                      <p className="text-green-300 text-xs mt-1">Solved</p>
                    )}
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <p className="text-white/40 text-sm">No recent activity.</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-fit">
            <h2 className="text-2xl font-light mb-4">Active Communities</h2>

            <div className="space-y-3">
              {stats.communities.map((community) => (
                <div
                  key={community.slug}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-xl"
                >
                  <span className="font-medium">{community.name}</span>
                  <span className="text-white/50 text-sm">
                    {community.contributions} contributions
                  </span>
                </div>
              ))}

              {stats.communities.length === 0 && (
                <p className="text-white/40 text-sm">No active communities.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
