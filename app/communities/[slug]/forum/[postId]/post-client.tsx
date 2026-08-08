"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

type CurrentUser = {
  username: string;
  role: string;
} | null;

type PostClientProps = {
  slug: string;
  postId: string;
  initialPost: ForumPost | null;
  currentUser?: CurrentUser;
};

export default function PostClient({
  slug,
  postId,
  initialPost,
  currentUser,
}: PostClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(initialPost);
  const [commentsList, setCommentsList] = useState<Comment[]>(initialPost?.comments || []);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [hasNewCommentsNotice, setHasNewCommentsNotice] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDeletePost = currentUser && (currentUser.username === post?.author || currentUser.role === "administrator");
  const canSolvePost = currentUser && (currentUser.username === post?.author || currentUser.role === "mentor" || currentUser.role === "administrator");

  // Real-time polling for new comments every 4 seconds
  useEffect(() => {
    if (!postId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/comments?postId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedComments: Comment[] = data.comments || [];
          // If server has more comments than local commentsList (from other users), notify
          if (fetchedComments.length > commentsList.length) {
            setHasNewCommentsNotice(true);
          }
        }
      } catch {
        // Ignore background polling errors silently
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [postId, commentsList.length]);

  const handleRefreshComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data.comments || []);
        setHasNewCommentsNotice(false);
      }
    } catch {
      // Ignore error
    }
  };

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reply.trim()) return;

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: reply.trim() }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Could not post reply.");
      return;
    }

    const nextComment: Comment = data.comment;
    setCommentsList((prev) => [nextComment, ...prev]);
    setReply("");
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);

    const res = await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
    if (res.ok) {
      router.push(`/communities/${slug}/forum`);
    } else {
      const data = await res.json();
      setError(data.error || "Could not delete post.");
      setIsDeleting(false);
    }
  };

  const handleToggleSolvePost = async () => {
    if (!post) return;
    const nextSolved = !post.solved;

    const res = await fetch("/api/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "toggleSolve", solved: nextSolved }),
    });

    if (res.ok) {
      setPost({ ...post, solved: nextSolved });
    }
  };

  const handleUpvotePost = async () => {
    if (!post) return;
    const res = await fetch("/api/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "upvote" }),
    });

    if (res.ok) {
      const data = await res.json();
      setPost({ ...post, upvotes: data.upvotes });
    }
  };

  const handleDeleteComment = async (commentId: string | number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const handleToggleAcceptComment = async (commentId: string | number, currentAccepted?: boolean) => {
    const nextState = !currentAccepted;
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "toggleAccept", accepted: nextState }),
    });

    if (res.ok) {
      setCommentsList((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, accepted: nextState } : c))
      );
    }
  };

  const handleUpvoteComment = async (commentId: string | number) => {
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "upvote" }),
    });

    if (res.ok) {
      const data = await res.json();
      setCommentsList((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, upvotes: data.upvotes } : c))
      );
    }
  };

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
    <main className="min-h-screen text-white p-6 relative">
      {/* Real-time Notification Banner / Popup */}
      {hasNewCommentsNotice && (
        <div className="fixed top-20 right-6 z-50 bg-flower-blue/90 border border-white/20 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce">
          <span>🔔 The page has been updated with new comments!</span>
          <button
            onClick={handleRefreshComments}
            className="bg-white text-flower-blue font-semibold px-3 py-1 rounded-xl text-sm hover:bg-white/90"
          >
            Refresh Comments
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href={`/communities/${slug}/forum`}
          className="inline-block text-white/50 hover:text-white"
        >
          ← Back to forum
        </Link>

        <section className="bg-white/5 rounded-3xl p-6 border border-white/5 relative">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex gap-2 mb-3 flex-wrap items-center">
                <span className="px-3 py-1 bg-white/5 rounded-lg text-sm capitalize">
                  {post.type}
                </span>

                {post.solved && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm">
                    Solved ✓
                  </span>
                )}

                {canSolvePost && (
                  <button
                    onClick={handleToggleSolvePost}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-green-300 transition"
                  >
                    {post.solved ? "Unmark Solved" : "Mark as Solved"}
                  </button>
                )}

                {canDeletePost && (
                  <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition ml-auto"
                  >
                    {isDeleting ? "Deleting..." : "Delete Post"}
                  </button>
                )}
              </div>

              <h1 className="text-4xl font-light tracking-tight">
                {post.title}
              </h1>

              <p className="text-white/50 mt-2">by @{post.author}</p>
            </div>

            <div className="text-right text-white/60 text-sm flex flex-col items-end">
              <button
                onClick={handleUpvotePost}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition text-white"
              >
                <span>{post.upvotes}</span>
                <span>↑</span>
              </button>
              <p className="mt-2">{commentsList.length} comments</p>
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
            {error && <p className="mr-auto text-red-300">{error}</p>}
            <button className="bg-flower-blue hover:bg-flower-blue/90 px-5 py-2 rounded-xl">
              {post.type === "question" ? "Post Answer" : "Post Reply"}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          {commentsList.map((comment) => {
            const canDeleteComment =
              currentUser &&
              (currentUser.username === comment.author || currentUser.role === "administrator");
            const canAcceptComment =
              currentUser &&
              (currentUser.username === post.author ||
                currentUser.role === "mentor" ||
                currentUser.role === "administrator");

            return (
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
                    <div className="flex items-center gap-3">
                      <p className="font-medium">@{comment.author}</p>

                      {comment.accepted && (
                        <span className="text-green-300 text-sm">
                          Accepted answer ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpvoteComment(comment.id)}
                      className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-sm text-white transition flex items-center gap-1"
                    >
                      <span>{comment.upvotes}</span>
                      <span>↑</span>
                    </button>

                    {canAcceptComment && (
                      <button
                        onClick={() => handleToggleAcceptComment(comment.id, comment.accepted)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-green-300 rounded-lg text-sm transition"
                      >
                        {comment.accepted ? "Unmark Accepted" : "Mark Accepted"}
                      </button>
                    )}

                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
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
            );
          })}
        </section>
      </div>
    </main>
  );
}
