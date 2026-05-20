"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ForumPost } from "../forum-client";

type Reply = {
  id: string | number;
  author: string;
  content: string;
};

type Comment = {
  id: string | number;
  author: string;
  content: string;
  upvotes: number;
  accepted?: boolean;
  replies?: Reply[];
};

type PostClientProps = {
  slug: string;
  postId: string;
  initialPost: ForumPost | null;
};

const demoPostsKey = (slug: string) => `fleurir-demo-posts:${slug}`;
const demoCommentsKey = (slug: string, postId: string) =>
  `fleurir-demo-comments:${slug}:${postId}`;

export default function PostClient({
  slug,
  postId,
  initialPost,
}: PostClientProps) {
  const [demoPost, setDemoPost] = useState<ForumPost | null>(null);
  const [demoComments, setDemoComments] = useState<Comment[]>([]);
  const [reply, setReply] = useState("");
  const [loadedDemoState, setLoadedDemoState] = useState(false);

  useEffect(() => {
    const savedPosts = window.localStorage.getItem(demoPostsKey(slug));
    const savedComments = window.localStorage.getItem(
      demoCommentsKey(slug, postId)
    );

    if (savedPosts) {
      try {
        const posts: ForumPost[] = JSON.parse(savedPosts);
        setDemoPost(posts.find((post) => post.id === postId) || null);
      } catch {
        setDemoPost(null);
      }
    }

    if (savedComments) {
      try {
        setDemoComments(JSON.parse(savedComments));
      } catch {
        setDemoComments([]);
      }
    }

    setLoadedDemoState(true);
  }, [postId, slug]);

  const post = demoPost || initialPost;

  const comments = useMemo(
    () => [...demoComments, ...(post?.comments || [])],
    [demoComments, post]
  );

  const handleReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reply.trim()) return;

    const nextComment: Comment = {
      id: `demo-comment-${Date.now()}`,
      author: "anna",
      content: reply.trim(),
      upvotes: 0,
      accepted: false,
      replies: [],
    };
    const nextComments = [nextComment, ...demoComments];

    setDemoComments(nextComments);
    setReply("");
    window.localStorage.setItem(
      demoCommentsKey(slug, postId),
      JSON.stringify(nextComments)
    );
  };

  if (!post && !loadedDemoState) {
    return (
      <main className="min-h-screen text-white p-10">
        <div className="max-w-3xl mx-auto text-white/50">
          Loading demo post...
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen text-white p-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <p>Post not found</p>
          <Link
            href={`/communities/${slug}/forum`}
            className="text-flower-blue hover:underline"
          >
            Back to forum
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href={`/communities/${slug}/forum`}
          className="inline-block text-white/50 hover:text-white"
        >
          ← Back to forum
        </Link>

        <section className="bg-white/5 rounded-3xl p-6 border border-white/5">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 bg-white/5 rounded-lg text-sm capitalize">
                  {post.type}
                </span>

                {post.solved && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm">
                    Solved ✓
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-light tracking-tight">
                {post.title}
              </h1>

              <p className="text-white/50 mt-2">by @{post.author}</p>
            </div>

            <div className="text-right text-white/60 text-sm">
              <p>{post.upvotes} ↑</p>
              <p>{comments.length} comments</p>
            </div>
          </div>

          <div className="mt-6 text-white/85 leading-relaxed">
            {post.content}
          </div>

          <div className="flex gap-2 mt-6 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </section>

        <form
          onSubmit={handleReply}
          className="bg-white/5 rounded-3xl p-5 border border-white/5"
        >
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder={
              post.type === "question"
                ? "Write your answer..."
                : "Join the discussion..."
            }
            rows={4}
            className="w-full bg-transparent resize-none outline-none placeholder:text-white/25"
          />

          <div className="flex justify-end mt-4">
            <button className="bg-flower-blue hover:bg-flower-blue/90 px-5 py-2 rounded-xl">
              {post.type === "question" ? "Post Answer" : "Post Reply"}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-2xl p-5 border ${
                comment.accepted
                  ? "bg-green-500/10 border-green-400/20"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">@{comment.author}</p>

                  {comment.accepted && (
                    <span className="text-green-300 text-sm">
                      Accepted answer ✓
                    </span>
                  )}
                </div>

                <p className="text-white/50 text-sm">{comment.upvotes} ↑</p>
              </div>

              <p className="mt-4 text-white/85">{comment.content}</p>

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-6 pl-4 border-l border-white/10 space-y-3">
                  {comment.replies.map((nestedReply) => (
                    <div key={nestedReply.id}>
                      <p className="text-sm text-white/50">
                        @{nestedReply.author}
                      </p>
                      <p className="text-white/80">{nestedReply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
