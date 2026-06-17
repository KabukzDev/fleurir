import { getForumPost } from "@/lib/demo-social";
import PostClient from "./post-client";

type PostPageProps = {
  params: Promise<{
    slug: string;
    postId: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { slug, postId } = await params;

  const post = await getForumPost(slug, postId);

  return (
    <PostClient
      slug={slug}
      postId={postId}
      initialPost={post}
    />
  );
}
