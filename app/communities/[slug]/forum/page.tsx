import { getCommunity, getForumPosts } from "@/lib/demo-social";
import { getUser } from "@/lib/auth";
import ForumClient from "./forum-client";

type ForumProps = {
  params: Promise<{ slug: string }>;
};

export default async function ForumPage({ params }: ForumProps) {
  const { slug } = await params;

  const [community, posts, user] = await Promise.all([
    getCommunity(slug),
    getForumPosts(slug),
    getUser(),
  ]);

  return (
    <ForumClient
      slug={slug}
      communityName={community?.name || slug}
      initialPosts={posts}
      currentUser={user ? { username: user.id, role: user.role } : null}
    />
  );
}
