import { getForumPost } from "@/lib/demo-social";
import { getUser } from "@/lib/auth";
import PostClient from "./post-client";

type PostPageProps = {
  params: Promise<{
    slug: string;
    postId: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { slug, postId } = await params;

  const [post, user] = await Promise.all([
    getForumPost(slug, postId),
    getUser(),
  ]);

  return (
    <PostClient
      slug={slug}
      postId={postId}
      initialPost={post}
      currentUser={user ? { username: user.id, role: user.role } : null}
    />
  );
}
