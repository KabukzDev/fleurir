import postsData from "@/data/posts.json";
import type { ForumPost } from "../forum-client";
import PostClient from "./post-client";

type PostPageProps = {
  params: Promise<{
    slug: string;
    postId: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { slug, postId } = await params;

  const communityPosts =
    postsData.communities[
      slug as keyof typeof postsData.communities
    ] || [];

  const post =
    communityPosts.find((item) => item.id === postId) || null;

  return (
    <PostClient
      slug={slug}
      postId={postId}
      initialPost={post as ForumPost | null}
    />
  );
}
