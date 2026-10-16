"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";
import type { ForumPost } from "../forum-client";

type Reply = {
  id: string | number;
  author: string;
  content: string;
  commentId?: string | number;
  parentReplyId?: string | number | null;
  createdAt?: string;
  replies?: Reply[];
};

type Comment = {
  id: string | number;
  author: string;
  content: string;
  attachmentUrl?: string;
  upvotes: number;
  accepted?: boolean;
  createdAt?: string;
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
  const { t, locale } = useTranslation();
  const [post, setPost] = useState<ForumPost | null>(initialPost);
  const [commentsList, setCommentsList] = useState<Comment[]>(initialPost?.comments || []);
  const [reply, setReply] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [hasNewCommentsNotice, setHasNewCommentsNotice] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTarget, setReplyingTarget] = useState<{
    commentId: string | number;
    replyId?: string | number;
    author: string;
  } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const canDeletePost = currentUser && (currentUser.username === post?.author || currentUser.role === "administrator");
  const canSolvePost = currentUser && (currentUser.username === post?.author || currentUser.role === "mentor" || currentUser.role === "administrator");

  const startDirectFileUpload = async (file: File) => {
    setError("");
    setUploadError("");
    setUploadProgress(0);
    setIsUploadingFile(true);
    setAttachmentName(file.name);
    setAttachmentFile(file);

    try {
      // Step 1: Request pre-signed upload URL from API
      const presignRes = await fetch("/api/storage/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
        }),
      });

      const presignText = await presignRes.text();
      let presignData;
      try {
        presignData = JSON.parse(presignText);
      } catch {
        throw new Error(`Pre-signed URL Error (${presignRes.status}): ${presignText.slice(0, 100)}`);
      }

      if (!presignRes.ok || !presignData?.signedUrl) {
        throw new Error(presignData?.error || "Failed to generate pre-signed upload URL.");
      }

      const { signedUrl, publicUrl } = presignData;

      // Step 2: Direct browser upload via XMLHttpRequest for progress monitoring
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`Storage Provider returned status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during direct storage upload."));
        };

        xhr.send(file);
      });

      setAttachmentUrl(publicUrl);
      setIsUploadingFile(false);
    } catch (err: any) {
      console.error("Direct upload error:", err);
      setUploadError(err.message || "Direct upload failed. Please retry.");
      setIsUploadingFile(false);
      setUploadProgress(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError(locale === "es" ? "El archivo supera el límite de 20MB." : "File exceeds maximum size limit of 20MB.");
      return;
    }

    void startDirectFileUpload(file);
  };

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reply.trim() && !attachmentUrl) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: reply.trim(),
          attachmentUrl: attachmentUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("common.errorGeneric"));
        setIsSubmitting(false);
        return;
      }

      setReply("");
      setAttachmentUrl("");
      setAttachmentName("");
      setAttachmentFile(null);
      setUploadProgress(null);
      setCommentsList((prev) => [...prev, data.comment]);
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshComments = async () => {
    try {
      const res = await fetch(`/api/posts?id=${postId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPost(data.post);
          setCommentsList(data.post.comments || []);
        }
      } else {
        const fallbackRes = await fetch(`/api/comments?postId=${postId}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.comments) {
            setCommentsList(fallbackData.comments);
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      setHasNewCommentsNotice(false);
    }
  };

  const handleSubmitReply = async (commentId: string | number, parentReplyId?: string | number) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          parentReplyId: parentReplyId || undefined,
          content: replyText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("common.errorGeneric"));
        setIsSubmittingReply(false);
        return;
      }

      setReplyText("");
      setReplyingTarget(null);

      const createdReply: Reply = {
        id: data.reply.id,
        author: data.reply.author,
        content: data.reply.content,
        commentId: data.reply.commentId,
        parentReplyId: data.reply.parentReplyId,
        createdAt: data.reply.createdAt,
        replies: [],
      };

      const addReplyToTree = (replies: Reply[] = []): Reply[] => {
        if (!parentReplyId) {
          return [...replies, createdReply];
        }
        return replies.map((r) => {
          if (String(r.id) === String(parentReplyId)) {
            return { ...r, replies: [...(r.replies || []), createdReply] };
          }
          if (r.replies && r.replies.length > 0) {
            return { ...r, replies: addReplyToTree(r.replies) };
          }
          return r;
        });
      };

      setCommentsList((prev) =>
        prev.map((c) => {
          if (String(c.id) === String(commentId)) {
            return {
              ...c,
              replies: addReplyToTree(c.replies || []),
            };
          }
          return c;
        })
      );
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (commentId: string | number, replyId: string | number) => {
    if (!confirm(t("forum.deleteReplyConfirm") || "Are you sure you want to delete this reply?")) return;
    setError("");

    try {
      const res = await fetch(`/api/comments?replyId=${replyId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not delete reply.");
        return;
      }

      const removeReplyFromTree = (replies: Reply[] = []): Reply[] => {
        return replies
          .filter((r) => String(r.id) !== String(replyId))
          .map((r) => ({
            ...r,
            replies: r.replies ? removeReplyFromTree(r.replies) : [],
          }));
      };

      setCommentsList((prev) =>
        prev.map((c) => {
          if (String(c.id) === String(commentId)) {
            return {
              ...c,
              replies: removeReplyFromTree(c.replies || []),
            };
          }
          return c;
        })
      );
    } catch {
      setError(t("common.errorGeneric"));
    }
  };

  const handleDeletePost = async () => {
    if (!confirm(t("forum.deleteConfirm"))) return;
    setError("");
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        router.push(`/communities/${slug}/forum`);
      } else {
        setError(data.error || "Could not delete post.");
        setIsDeleting(false);
      }
    } catch {
      setError(t("common.errorGeneric"));
      setIsDeleting(false);
    }
  };

  const handleToggleSolvePost = async () => {
    if (!post) return;
    setError("");
    const nextSolved = !post.solved;

    const res = await fetch("/api/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "toggleSolve", solved: nextSolved }),
    });
    const data = await res.json();

    if (res.ok) {
      setPost({ ...post, solved: nextSolved });
    } else {
      setError(data.error || "Could not update post.");
    }
  };

  const handleUpvotePost = async () => {
    if (!post) return;
    setError("");
    const res = await fetch("/api/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action: "upvote" }),
    });
    const data = await res.json();

    if (res.ok) {
      setPost({ ...post, upvotes: data.upvotes });
    } else {
      setError(data.error || "Could not upvote post.");
    }
  };

  const handleDeleteComment = async (commentId: string | number) => {
    if (!confirm(t("forum.deleteConfirm"))) return;
    setError("");

    const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      setError(data.error || "Could not delete comment.");
    }
  };

  const handleToggleAcceptComment = async (commentId: string | number, currentAccepted?: boolean) => {
    setError("");
    const nextState = !currentAccepted;
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "toggleAccept", accepted: nextState }),
    });
    const data = await res.json();

    if (res.ok) {
      setCommentsList((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, accepted: nextState } : c))
      );
    } else {
      setError(data.error || "Could not update comment.");
    }
  };

  const handleUpvoteComment = async (commentId: string | number) => {
    setError("");
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "upvote" }),
    });
    const data = await res.json();

    if (res.ok) {
      setCommentsList((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, upvotes: data.upvotes } : c))
      );
    } else {
      setError(data.error || "Could not upvote comment.");
    }
  };

  if (!post) {
    return (
      <main className="min-h-screen text-white p-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <p>{locale === "es" ? "Publicación no encontrada" : "Post not found"}</p>
          <Link
            href={`/communities/${slug}/forum`}
            className="text-flower-blue hover:underline"
          >
            {locale === "es" ? "Volver al foro" : "Back to forum"}
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
          <span>🔔 {t("forum.newCommentsNotice")}</span>
          <button
            onClick={handleRefreshComments}
            className="bg-white text-flower-blue font-semibold px-3 py-1 rounded-xl text-sm hover:bg-white/90 cursor-pointer"
          >
            {t("forum.refreshComments")}
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href={`/communities/${slug}/forum`}
          className="inline-block text-white/50 hover:text-white"
        >
          ← {locale === "es" ? "Volver al foro" : "Back to forum"}
        </Link>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-2xl flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-sm opacity-70 hover:opacity-100 cursor-pointer">✕</button>
          </div>
        )}

        <section className="bg-white/5 rounded-3xl p-6 border border-white/5 relative">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex gap-2 mb-3 flex-wrap items-center">
                <span className="px-3 py-1 bg-white/5 rounded-lg text-sm capitalize">
                  {post.type}
                </span>

                {post.solved && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm">
                    {t("common.solved")} ✓
                  </span>
                )}

                {canSolvePost && (
                  <button
                    onClick={handleToggleSolvePost}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-green-300 transition cursor-pointer"
                  >
                    {post.solved ? (locale === "es" ? "Quitar Resuelto" : "Unmark Solved") : t("forum.markSolved")}
                  </button>
                )}

                {canDeletePost && (
                  <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition ml-auto cursor-pointer"
                  >
                    {isDeleting ? t("common.deleting") : t("forum.deletePost")}
                  </button>
                )}
              </div>

              <h1 className="text-4xl font-light tracking-tight">
                {post.title}
              </h1>

              <p className="text-white/50 mt-2">{locale === "es" ? "por" : "by"} @{post.author}</p>
            </div>

            <div className="text-right text-white/60 text-sm flex flex-col items-end">
              <button
                onClick={handleUpvotePost}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition text-white cursor-pointer"
              >
                <span>{post.upvotes}</span>
                <span>↑</span>
              </button>
              <p className="mt-2">{commentsList.length} {t("common.comments")}</p>
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
          className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-3"
        >
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder={
              post.type === "question"
                ? t("forum.replyPlaceholderQuestion")
                : t("forum.replyPlaceholderDiscussion")
            }
            rows={4}
            className="w-full bg-transparent resize-none outline-none placeholder:text-white/25"
          />

          {/* Attachment Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-sm">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition text-sm font-medium">
                <span>📎 {t("forum.attachFile")}</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-white/40 text-xs">
                {t("forum.attachmentLimits")}
              </span>
            </div>

            {attachmentUrl && (
              <button
                type="button"
                onClick={() => {
                  setAttachmentUrl("");
                  setAttachmentName("");
                }}
                className="text-red-300 hover:text-red-400 text-xs px-2 cursor-pointer"
              >
                {t("forum.clearAttachment")}
              </button>
            )}
          </div>

          {/* Real-time Direct-to-Cloud Upload Progress Bar & Preview */}
          {(isUploadingFile || (uploadProgress !== null && uploadProgress < 100) || attachmentUrl || uploadError) && (
            <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-2xl max-w-sm">
              {isUploadingFile || (uploadProgress !== null && uploadProgress < 100) ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-white/80 font-medium">
                    <span className="truncate max-w-[200px] flex items-center gap-1.5">
                      <span className="animate-pulse">☁️</span> {attachmentName || t("common.uploading")}
                    </span>
                    <span className="text-flower-blue font-bold">{uploadProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden relative">
                    <div
                      className="bg-flower-blue h-full transition-all duration-200 rounded-full"
                      style={{ width: `${uploadProgress || 0}%` }}
                    />
                  </div>
                </div>
              ) : uploadError ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-red-300 font-medium">{uploadError}</span>
                  {attachmentFile && (
                    <button
                      type="button"
                      onClick={() => startDirectFileUpload(attachmentFile)}
                      className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
                    >
                      {t("common.retry")}
                    </button>
                  )}
                </div>
              ) : attachmentUrl ? (
                <div className="flex items-center justify-between gap-2">
                  {attachmentUrl.startsWith("data:image/") || attachmentUrl.match(/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i) ? (
                    <img
                      src={attachmentUrl}
                      alt="Attachment Preview"
                      className="max-h-36 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-flower-blue">
                      <span className="text-xl">📄</span>
                      <span className="font-medium truncate max-w-[200px]">{attachmentName || t("forum.attachedDocument")}</span>
                    </div>
                  )}
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">✓ {t("common.uploaded")}</span>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex justify-end mt-4">
            {error && <p className="mr-auto text-red-300 text-sm font-medium">{error}</p>}
            <button
              disabled={isSubmitting}
              className="bg-flower-blue hover:bg-flower-blue/90 disabled:opacity-50 px-5 py-2 rounded-xl text-white font-medium transition cursor-pointer"
            >
              {isSubmitting
                ? t("common.uploading")
                : t("forum.postReply")}
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
                          {t("forum.acceptedSolution")} ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpvoteComment(comment.id)}
                      className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-sm text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{comment.upvotes}</span>
                      <span>↑</span>
                    </button>

                    {currentUser && (
                      <button
                        onClick={() => {
                          if (replyingTarget?.commentId === comment.id && !replyingTarget?.replyId) {
                            setReplyingTarget(null);
                            setReplyText("");
                          } else {
                            setReplyingTarget({ commentId: comment.id, author: comment.author });
                            setReplyText("");
                          }
                        }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-sm transition flex items-center gap-1 cursor-pointer"
                      >
                        <span className="icon icon-rounded text-sm">reply</span>
                        <span>{t("forum.reply")}</span>
                      </button>
                    )}

                    {canAcceptComment && (
                      <button
                        onClick={() => handleToggleAcceptComment(comment.id, comment.accepted)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-green-300 rounded-lg text-sm transition cursor-pointer"
                      >
                        {comment.accepted ? (locale === "es" ? "Quitar Aceptada" : "Unmark Accepted") : t("forum.markAccepted")}
                      </button>
                    )}

                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition cursor-pointer"
                      >
                        {t("common.delete")}
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-white/85">{comment.content}</p>

                {/* Rich Attachment rendering */}
                {comment.attachmentUrl && (
                  <div className="mt-4">
                    {comment.attachmentUrl.startsWith("data:image/") || comment.attachmentUrl.match(/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i) ? (
                      <img
                        src={comment.attachmentUrl}
                        alt="Comment attachment"
                        className="max-h-64 rounded-xl object-contain border border-white/10 bg-black/40"
                      />
                    ) : (
                      (() => {
                        let name = "Attached Document";
                        if (comment.attachmentUrl.includes(";name=")) {
                          const match = comment.attachmentUrl.match(/;name=([^;]+)/);
                          if (match) name = decodeURIComponent(match[1]);
                        } else if (comment.attachmentUrl.startsWith("http") || comment.attachmentUrl.startsWith("/")) {
                          const parts = comment.attachmentUrl.split("/");
                          name = parts[parts.length - 1] || "Attachment";
                        }

                        let icon = "📄";
                        let type = "Document";
                        const lower = name.toLowerCase();
                        if (lower.endsWith(".pdf") || comment.attachmentUrl.includes("application/pdf")) {
                          icon = "📕";
                          type = "PDF Document";
                        } else if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
                          icon = "📝";
                          type = "Word Document";
                        } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
                          icon = "📊";
                          type = "Excel Spreadsheet";
                        } else if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) {
                          icon = "📙";
                          type = "Presentation";
                        }

                        return (
                          <a
                            href={comment.attachmentUrl}
                            download={name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition max-w-sm"
                          >
                            <span className="text-2xl">{icon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium text-sm truncate">{name}</p>
                              <p className="text-white/40 text-xs">{type}</p>
                            </div>
                            <span className="text-flower-blue text-xs font-semibold px-2.5 py-1 bg-flower-blue/15 rounded-lg shrink-0">
                              {locale === "es" ? "Descargar ⬇" : "Download ⬇"}
                            </span>
                          </a>
                        );
                      })()
                    )}
                  </div>
                )}

                {/* Inline Reply Form under top-level Comment */}
                {replyingTarget?.commentId === comment.id && !replyingTarget?.replyId && (
                  <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <p className="text-xs text-white/50 font-medium">
                      {t("forum.replyingTo")} <span className="text-flower-blue">@{comment.author}</span>
                    </p>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={locale === "es" ? "Escribe tu respuesta..." : "Write your reply..."}
                      rows={2}
                      className="w-full bg-black/40 text-sm text-white rounded-lg p-2.5 outline-none resize-none placeholder:text-white/20 border border-white/10 focus:border-flower-blue/50"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTarget(null);
                          setReplyText("");
                        }}
                        className="px-3 py-1 rounded-lg text-xs text-white/60 hover:text-white transition cursor-pointer"
                      >
                        {t("forum.cancel")}
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingReply || !replyText.trim()}
                        onClick={() => handleSubmitReply(comment.id)}
                        className="px-3.5 py-1 bg-flower-blue hover:bg-flower-blue/90 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                      >
                        {isSubmittingReply ? (locale === "es" ? "Enviando..." : "Sending...") : t("forum.sendReply")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Recursive Threaded Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                    {comment.replies.map((nestedReply) => (
                      <ThreadedReplyItem
                        key={nestedReply.id}
                        reply={nestedReply}
                        commentId={comment.id}
                        currentUser={currentUser}
                        locale={locale}
                        t={t}
                        replyingTarget={replyingTarget}
                        setReplyingTarget={setReplyingTarget}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        isSubmittingReply={isSubmittingReply}
                        onSubmitReply={handleSubmitReply}
                        onDeleteReply={handleDeleteReply}
                        depth={0}
                      />
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

type ThreadedReplyItemProps = {
  reply: Reply;
  commentId: string | number;
  currentUser?: CurrentUser;
  locale: string;
  t: (key: string) => string;
  replyingTarget: { commentId: string | number; replyId?: string | number; author: string } | null;
  setReplyingTarget: (target: { commentId: string | number; replyId?: string | number; author: string } | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  isSubmittingReply: boolean;
  onSubmitReply: (commentId: string | number, parentReplyId?: string | number) => void;
  onDeleteReply: (commentId: string | number, replyId: string | number) => void;
  depth?: number;
};

function ThreadedReplyItem({
  reply,
  commentId,
  currentUser,
  locale,
  t,
  replyingTarget,
  setReplyingTarget,
  replyText,
  setReplyText,
  isSubmittingReply,
  onSubmitReply,
  onDeleteReply,
  depth = 0,
}: ThreadedReplyItemProps) {
  const isReplyingToThis =
    String(replyingTarget?.commentId) === String(commentId) &&
    String(replyingTarget?.replyId) === String(reply.id);

  const canDelete =
    currentUser &&
    (currentUser.username === reply.author || currentUser.role === "administrator");

  return (
    <div
      className={`relative ${
        depth > 0
          ? "mt-3 ml-2 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-white/10 hover:border-flower-blue/50 transition-colors"
          : "mt-3"
      }`}
    >
      <div className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${reply.author}`}
              className="text-xs font-semibold text-white/90 hover:text-flower-blue transition"
            >
              @{reply.author}
            </Link>
          </div>
          {canDelete && (
            <button
              onClick={() => onDeleteReply(commentId, reply.id)}
              className="text-xs text-red-400 hover:text-red-300 opacity-70 hover:opacity-100 transition cursor-pointer"
            >
              {t("forum.deleteReply")}
            </button>
          )}
        </div>

        <p className="mt-1.5 text-sm text-white/85 leading-relaxed">{reply.content}</p>

        <div className="mt-2 flex items-center gap-3">
          {currentUser && (
            <button
              onClick={() => {
                if (isReplyingToThis) {
                  setReplyingTarget(null);
                  setReplyText("");
                } else {
                  setReplyingTarget({ commentId, replyId: reply.id, author: reply.author });
                  setReplyText("");
                }
              }}
              className="text-xs font-medium text-white/50 hover:text-flower-blue flex items-center gap-1 transition cursor-pointer"
            >
              <span className="icon icon-rounded text-sm">reply</span>
              <span>{t("forum.reply")}</span>
            </button>
          )}
        </div>
      </div>

      {isReplyingToThis && (
        <div className="mt-2 ml-2 sm:ml-4 p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
          <p className="text-xs text-white/50 font-medium">
            {t("forum.replyingTo")} <span className="text-flower-blue">@{reply.author}</span>
          </p>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={locale === "es" ? "Escribe tu respuesta..." : "Write your reply..."}
            rows={2}
            className="w-full bg-black/40 text-sm text-white rounded-lg p-2.5 outline-none resize-none placeholder:text-white/20 border border-white/10 focus:border-flower-blue/50"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setReplyingTarget(null);
                setReplyText("");
              }}
              className="px-3 py-1 rounded-lg text-xs text-white/60 hover:text-white transition cursor-pointer"
            >
              {t("forum.cancel")}
            </button>
            <button
              type="button"
              disabled={isSubmittingReply || !replyText.trim()}
              onClick={() => onSubmitReply(commentId, reply.id)}
              className="px-3.5 py-1 bg-flower-blue hover:bg-flower-blue/90 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition cursor-pointer"
            >
              {isSubmittingReply ? (locale === "es" ? "Enviando..." : "Sending...") : t("forum.sendReply")}
            </button>
          </div>
        </div>
      )}

      {reply.replies && reply.replies.length > 0 && (
        <div className="space-y-2">
          {reply.replies.map((childReply) => (
            <ThreadedReplyItem
              key={childReply.id}
              reply={childReply}
              commentId={commentId}
              currentUser={currentUser}
              locale={locale}
              t={t}
              replyingTarget={replyingTarget}
              setReplyingTarget={setReplyingTarget}
              replyText={replyText}
              setReplyText={setReplyText}
              isSubmittingReply={isSubmittingReply}
              onSubmitReply={onSubmitReply}
              onDeleteReply={onDeleteReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
