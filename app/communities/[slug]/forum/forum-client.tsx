"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";

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

export type ForumPost = {
  id: string;
  title: string;
  type: string;
  content: string;
  author: string;
  upvotes: number;
  replies: number;
  solved: boolean;
  tags: string[];
  comments: Comment[];
  createdAt?: string;
};

type ForumClientProps = {
  slug: string;
  communityName: string;
  initialPosts: ForumPost[];
  currentUser?: {
    username: string;
    role: string;
  } | null;
};

export default function ForumClient({
  slug,
  communityName,
  initialPosts,
}: ForumClientProps) {
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState("");
  const [solvedOnly, setSolvedOnly] = useState(false);
  const [sortMode, setSortMode] = useState<"latest" | "top">("latest");

  const posts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialPosts
      .filter((post) => {
        if (solvedOnly && !post.solved) return false;
        if (!normalizedQuery) return true;

        return [
          post.title,
          post.content,
          post.author,
          ...post.tags,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sortMode === "top") return b.upvotes - a.upvotes;

        const dateA = a.createdAt ? Date.parse(a.createdAt) : 0;
        const dateB = b.createdAt ? Date.parse(b.createdAt) : 0;

        return dateB - dateA;
      });
  }, [initialPosts, query, solvedOnly, sortMode]);

  const topCollaborators = useMemo(() => {
    const scores = new Map<string, number>();

    for (const post of initialPosts) {
      scores.set(post.author, (scores.get(post.author) || 0) + 2);

      for (const comment of post.comments || []) {
        scores.set(comment.author, (scores.get(comment.author) || 0) + 1);

        for (const reply of comment.replies || []) {
          scores.set(reply.author, (scores.get(reply.author) || 0) + 1);
        }
      }
    }

    return [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([author]) => author);
  }, [initialPosts]);

  return (
    <main className="min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto flex gap-6">
        <section className="flex-1 space-y-4">
          <div className="bg-white/5 rounded-3xl p-6">
            <h1 className="text-4xl font-light">{locale === "es" ? `Foro de ${communityName}` : `${communityName} Forum`}</h1>
            <p className="text-white/50 mt-2">
              {locale === "es" ? "Haz preguntas, resuelve dudas y debate con tus compañeros." : "Ask questions, solve doubts, and discuss with your peers."}
            </p>

            <div className="flex gap-3 mt-4">
              <Link
                className="bg-flower-blue px-4 py-2 rounded-xl text-white font-medium hover:bg-flower-blue/90 cursor-pointer"
                href={`/communities/${slug}/forum/ask?type=question`}
              >
                {t("communities.askQuestion")}
              </Link>
              <Link
                className="border border-white/10 px-4 py-2 rounded-xl text-white hover:bg-white/10 cursor-pointer"
                href={`/communities/${slug}/forum/ask?type=discussion`}
              >
                {t("forum.newDiscussionTitle")}
              </Link>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("communities.searchForum")}
              className="flex-1 bg-white/5 px-4 py-3 rounded-xl outline-none border border-white/5 placeholder:text-white/30"
            />

            <button
              onClick={() =>
                setSortMode((current) =>
                  current === "latest" ? "top" : "latest"
                )
              }
              className="bg-white/5 px-4 rounded-xl hover:bg-white/10 cursor-pointer"
            >
              {sortMode === "latest" ? (locale === "es" ? "Recientes" : "Latest") : (locale === "es" ? "Destacados" : "Top")}
            </button>

            <button
              onClick={() => setSolvedOnly((current) => !current)}
              className={`px-4 rounded-xl cursor-pointer ${
                solvedOnly ? "bg-green-500/25 text-green-200" : "bg-white/5"
              }`}
            >
              {t("communities.solvedFilter")}
            </button>
          </div>

          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/communities/${slug}/forum/${post.id}`}
              className="block bg-white/5 hover:bg-white/7 transition rounded-2xl p-5"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-xl">{post.title}</h2>

                  <p className="text-white/50 text-sm mt-1">
                    {locale === "es" ? "por" : "by"} @{post.author}
                  </p>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-white/5 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right space-y-2 shrink-0">
                  <p>{post.upvotes} ↑</p>
                  <p>{post.comments.length} {t("common.comments")}</p>

                  {post.solved && (
                    <span className="text-green-400 text-sm">{t("common.solved")} ✓</span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="bg-white/5 rounded-2xl p-8 text-center text-white/50">
              {t("communities.noPosts")}
            </div>
          )}
        </section>

        <aside className="w-80 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4">
            <h3 className="text-lg">{locale === "es" ? "Estadísticas de la Comunidad" : "Community Stats"}</h3>
            <p className="text-white/50 mt-2">{posts.length} {locale === "es" ? "publicaciones visibles" : "visible posts"}</p>
            <p className="text-white/50">
              {posts.filter((post) => post.solved).length} {locale === "es" ? "publicaciones resueltas" : "solved threads"}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg">{locale === "es" ? "Principales colaboradores" : "Top collaborators"}</h3>
              <Link
                href={`/communities/${slug}/members`}
                className="text-sm text-flower-blue hover:underline"
              >
                {locale === "es" ? "Ver todos" : "View all"}
              </Link>
            </div>
            <ul className="mt-2 space-y-2 text-white/60">
              {topCollaborators.map((author) => (
                <li key={author}>
                  <span className="text-white pr-2">@{author}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
