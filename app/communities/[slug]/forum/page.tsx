import communitiesData from "@/data/communities.json";
import postsData from "@/data/posts.json";
import ForumClient, { type ForumPost } from "./forum-client";

type ForumProps = {
  params: Promise<{ slug: string }>;
};

export default async function ForumPage({ params }: ForumProps) {
  const { slug } = await params;

  const posts =
    postsData.communities[
      slug as keyof typeof postsData.communities
    ] || [];

  return (
    <ForumClient
      slug={slug}
      communityName={
        communitiesData[slug as keyof typeof communitiesData]?.name || slug
      }
      initialPosts={posts as ForumPost[]}
    />
  );
}
