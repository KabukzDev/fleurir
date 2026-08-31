"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export default function AskPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();

  const slug = params.slug;
  const type = searchParams.get("type") || "question";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [error, setError] = useState("");

  const publishLabel = useMemo(
    () => (type === "question" ? t("forum.submitPost") : (locale === "es" ? "Publicar Debate" : "Publish Discussion")),
    [type, locale, t]
  );

  const setType = (newType: string) => {
    router.replace(`${pathname}?type=${newType}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void publishPost();
  };

  const publishPost = async () => {
    if (!title.trim() || !content.trim()) {
      setError(locale === "es" ? "Agrega un título y detalles antes de publicar." : "Add a title and details before publishing.");
      return;
    }

    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communitySlug: slug,
        title: title.trim(),
        type,
        content: content.trim(),
        tags:
          parsedTags.length > 0
            ? parsedTags
            : type === "question"
              ? [difficulty.toLowerCase(), "question"]
              : ["discussion"],
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || t("common.errorGeneric"));
      return;
    }

    router.push(`/communities/${slug}/forum/${data.post.id}`);
  };

  return (
    <main className="min-h-screen text-white p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-light">
            {type === "question" ? t("forum.askQuestionTitle") : t("forum.newDiscussionTitle")}
          </h1>
          <p className="text-white/50 mt-2">
            {locale === "es" ? "Pide ayuda, inicia un debate o comparte conocimientos con tu comunidad." : "Ask for help, start a discussion, or share knowledge."}
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <p className="mb-3 text-sm text-white/60">{t("forum.typeLabel")}</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType("question")}
              className={`px-4 py-2 rounded-xl cursor-pointer ${
                type === "question" ? "bg-flower-blue font-medium" : "bg-white/5"
              }`}
            >
              {t("forum.typeQuestion")}
            </button>

            <button
              type="button"
              onClick={() => setType("discussion")}
              className={`px-4 py-2 rounded-xl cursor-pointer ${
                type === "discussion" ? "bg-flower-blue font-medium" : "bg-white/5"
              }`}
            >
              {t("forum.typeDiscussion")}
            </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <label htmlFor="post-title" className="text-sm text-white/60">
            {t("forum.titleLabel")}
          </label>
          <input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            type="text"
            placeholder={t("forum.titlePlaceholder")}
            className="w-full mt-2 bg-transparent outline-none text-xl placeholder:text-white/30"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <label htmlFor="post-content" className="text-sm text-white/60">
            {t("forum.contentLabel")}
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t("forum.contentPlaceholder")}
            rows={8}
            className="w-full mt-2 bg-transparent outline-none resize-none placeholder:text-white/30"
          />
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <label htmlFor="post-tags" className="text-sm text-white/60">
            {t("forum.tagsLabel")}
          </label>
          <input
            id="post-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            type="text"
            placeholder={t("forum.tagsPlaceholder")}
            className="w-full mt-2 bg-transparent outline-none placeholder:text-white/30"
          />
        </div>

        {type === "question" && (
          <div className="bg-white/5 rounded-2xl p-4">
            <label htmlFor="post-difficulty" className="text-sm text-white/60">
              {locale === "es" ? "Nivel de Dificultad" : "Difficulty"}
            </label>

            <select
              id="post-difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-3 text-white"
            >
              <option value="Beginner">{locale === "es" ? "Principiante" : "Beginner"}</option>
              <option value="Intermediate">{locale === "es" ? "Intermedio" : "Intermediate"}</option>
              <option value="Advanced">{locale === "es" ? "Avanzado" : "Advanced"}</option>
            </select>
          </div>
        )}

        {error && <p className="text-red-300 text-sm">{error}</p>}

        <button className="w-full bg-flower-blue py-4 rounded-2xl text-lg font-medium cursor-pointer hover:bg-flower-blue/90 transition">
          {publishLabel}
        </button>
      </form>
    </main>
  );
}
