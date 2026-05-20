"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import type { ForumPost } from "../forum-client";

const demoPostsKey = (slug: string) => `fleurir-demo-posts:${slug}`;

export default function AskPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const slug = params.slug;
  const type = searchParams.get("type") || "question";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [error, setError] = useState("");

  const publishLabel = useMemo(
    () => (type === "question" ? "Publish question" : "Publish discussion"),
    [type]
  );

  const setType = (newType: string) => {
    router.replace(`${pathname}?type=${newType}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Add a title and details before publishing.");
      return;
    }

    const saved = window.localStorage.getItem(demoPostsKey(slug));
    const currentPosts: ForumPost[] = saved ? JSON.parse(saved) : [];
    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const post: ForumPost = {
      id: `demo-${Date.now()}`,
      title: title.trim(),
      type,
      content: content.trim(),
      author: "anna",
      upvotes: 0,
      replies: 0,
      solved: false,
      tags:
        parsedTags.length > 0
          ? parsedTags
          : type === "question"
            ? [difficulty.toLowerCase(), "question"]
            : ["discussion"],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      demoPostsKey(slug),
      JSON.stringify([post, ...currentPosts])
    );

    router.push(`/communities/${slug}/forum/${post.id}`);
  };

  return (
    <main className="min-h-screen text-white p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-light">Create post</h1>
          <p className="text-white/50 mt-2">
            Ask for help, start a discussion, or share knowledge.
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <p className="mb-3 text-sm text-white/60">Post type</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("question")}
              className={`px-4 py-2 rounded-xl cursor-pointer ${
                type === "question" ? "bg-flower-blue" : "bg-white/5"
              }`}
            >
              Question
            </button>

            <button
              type="button"
              onClick={() => setType("discussion")}
              className={`px-4 py-2 rounded-xl cursor-pointer ${
                type === "discussion" ? "bg-flower-blue" : "bg-white/5"
              }`}
            >
              Discussion
            </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <label htmlFor="post-title" className="text-sm text-white/60">
            Title
          </label>
          <input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            type="text"
            placeholder="What do you need help with?"
            className="w-full mt-2 bg-transparent outline-none text-xl"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <label htmlFor="post-content" className="text-sm text-white/60">
            Details
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Explain your question or topic..."
            rows={8}
            className="w-full mt-2 bg-transparent outline-none resize-none"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <label htmlFor="post-tags" className="text-sm text-white/60">
            Tags
          </label>
          <input
            id="post-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            type="text"
            placeholder="grammar, verbs, vocabulary"
            className="w-full mt-2 bg-transparent outline-none"
          />
        </div>

        {type === "question" && (
          <div className="bg-white/5 rounded-2xl p-4">
            <label htmlFor="post-difficulty" className="text-sm text-white/60">
              Difficulty
            </label>

            <select
              id="post-difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="w-full mt-2 bg-black/20 rounded-xl p-3"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        )}

        {error && <p className="text-red-300">{error}</p>}

        <button className="w-full bg-flower-blue py-4 rounded-2xl text-lg cursor-pointer hover:bg-flower-blue/90">
          {publishLabel}
        </button>
      </form>
    </main>
  );
}
