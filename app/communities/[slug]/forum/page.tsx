import { getCommunity, getForumPosts } from "@/lib/demo-social";
import ForumClient from "./forum-client";

type ForumProps = {
  params: Promise<{ slug: string }>;
};

export default async function ForumPage({ params }: ForumProps) {
  const { slug } = await params;

  const [community, posts] = await Promise.all([
    getCommunity(slug),
    getForumPosts(slug),
  ]);

  return (
    <ForumClient
      slug={slug}
      communityName={community?.name || slug}
      initialPosts={posts}
    />
  );
}
