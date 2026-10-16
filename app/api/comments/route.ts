import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { addPointsToUser } from "@/lib/points";

import { buildReplyTree } from "@/lib/demo-social";

export async function GET(request: Request) {
  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());
  if (!db) {
    return NextResponse.json({ comments: [] });
  }

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  const { data, error } = await db
    .from("comments")
    .select("id, author_username, content, attachment_url, upvotes, accepted, created_at, comment_replies(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const comments = (data || []).map((c) => ({
    id: c.id,
    author: c.author_username,
    content: c.content,
    attachmentUrl: c.attachment_url,
    upvotes: c.upvotes,
    accepted: c.accepted,
    createdAt: c.created_at,
    replies: buildReplyTree(c.comment_replies || []),
  }));

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const user = await getUser();
  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());

  if (!db) {
    return NextResponse.json(
      { error: "Database client unavailable." },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let postId = "";
  let content = "";
  let attachmentUrl: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      postId = String(formData.get("postId") || "").trim();
      content = String(formData.get("content") || "").trim();
      const file = formData.get("file") as File | null;

      if (file && file.size > 0) {
        const MAX_FILE_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "File exceeds 20MB upload limit." },
            { status: 400 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || "application/octet-stream";
        const fileName = file.name || `file_${Date.now()}`;

        const { uploadFileToGoogleDrive } = await import("@/lib/gdrive");
        attachmentUrl = await uploadFileToGoogleDrive(buffer, fileName, mimeType);
      }
    } catch (err: any) {
      return NextResponse.json(
        { error: `File Processing Error: ${err?.message || "Invalid upload format."}` },
        { status: 400 }
      );
    }
  } else {
    // Legacy / JSON Payload fallback
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "File attachment is too large for JSON payload. Please attach directly." },
        { status: 413 }
      );
    }

    const commentId = body.commentId ? String(body.commentId).trim() : null;
    if (commentId) {
      const content = String(body.content || "").trim();
      const parentReplyId = body.parentReplyId ? String(body.parentReplyId).trim() : null;

      if (!content) {
        return NextResponse.json({ error: "Reply content is required." }, { status: 400 });
      }

      const { data: parentComment, error: commentFetchErr } = await db
        .from("comments")
        .select("id")
        .eq("id", commentId)
        .maybeSingle();

      if (commentFetchErr || !parentComment) {
        return NextResponse.json({ error: "Comment not found." }, { status: 404 });
      }

      let replyData: any = null;
      let replyError: any = null;

      if (parentReplyId) {
        const res = await db
          .from("comment_replies")
          .insert({
            comment_id: commentId,
            parent_reply_id: parentReplyId,
            author_username: user.id,
            content,
          })
          .select("id, comment_id, parent_reply_id, author_username, content, created_at")
          .single();

        if (res.error && res.error.message?.includes("parent_reply_id")) {
          const fallbackRes = await db
            .from("comment_replies")
            .insert({
              comment_id: commentId,
              author_username: user.id,
              content,
            })
            .select("id, comment_id, author_username, content, created_at")
            .single();
          replyData = fallbackRes.data;
          replyError = fallbackRes.error;
        } else {
          replyData = res.data;
          replyError = res.error;
        }
      } else {
        const res = await db
          .from("comment_replies")
          .insert({
            comment_id: commentId,
            author_username: user.id,
            content,
          })
          .select("id, comment_id, author_username, content, created_at")
          .single();
        replyData = res.data;
        replyError = res.error;
      }

      if (replyError) {
        return NextResponse.json({ error: replyError.message }, { status: 400 });
      }

      // Award +1 point to author for posting a reply
      await addPointsToUser(user.id, 1);

      return NextResponse.json({
        reply: {
          id: String(replyData.id),
          author: replyData.author_username,
          content: replyData.content,
          commentId: String(replyData.comment_id),
          parentReplyId: replyData.parent_reply_id ? String(replyData.parent_reply_id) : null,
          createdAt: replyData.created_at,
          replies: [],
        },
      });
    }

    postId = String(body.postId || "").trim();
    content = String(body.content || "").trim();
    attachmentUrl = body.attachmentUrl ? String(body.attachmentUrl).trim() : null;

    if (attachmentUrl && attachmentUrl.startsWith("data:")) {
      try {
        const match = attachmentUrl.match(/^data:([^;]+);(?:name=([^;]+);)?base64,(.+)$/);
        if (match) {
          const mimeType = match[1] || "application/octet-stream";
          const rawFileName = match[2] ? decodeURIComponent(match[2]) : `attachment_${Date.now()}`;
          const base64Data = match[3];
          const buffer = Buffer.from(base64Data, "base64");

          const { uploadFileToGoogleDrive } = await import("@/lib/gdrive");
          attachmentUrl = await uploadFileToGoogleDrive(buffer, rawFileName, mimeType);
        }
      } catch (gdriveErr: any) {
        return NextResponse.json(
          { error: `Google Drive Upload Failed: ${gdriveErr?.message || "Storage error"}` },
          { status: 500 }
        );
      }
    }
  }

  if (!content) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  if (!postId) {
    return NextResponse.json({ error: "Post ID required." }, { status: 400 });
  }

  const { data, error } = await db
    .from("comments")
    .insert({
      post_id: postId,
      author_username: user.id,
      content,
      attachment_url: attachmentUrl,
    })
    .select("id, author_username, content, attachment_url, upvotes, accepted")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Award +1 point to author for posting a comment
  await addPointsToUser(user.id, 1);

  return NextResponse.json({
    comment: {
      id: data.id,
      author: data.author_username,
      content: data.content,
      attachmentUrl: data.attachment_url,
      upvotes: data.upvotes,
      accepted: data.accepted,
      replies: [],
    },
  });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());

  if (!db || !user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("id");
  const replyId = searchParams.get("replyId");

  if (replyId) {
    const { data: reply } = await db
      .from("comment_replies")
      .select("author_username")
      .eq("id", replyId)
      .maybeSingle();

    if (!reply) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    const isAuthor = reply.author_username === user.id;
    const isAdmin = user.role === "administrator";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Permission denied. Only author or administrator can delete this reply." },
        { status: 403 }
      );
    }

    const { error } = await db.from("comment_replies").delete().eq("id", replyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
  }

  const { data: comment } = await db
    .from("comments")
    .select("author_username")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const isAuthor = comment.author_username === user.id;
  const isAdmin = user.role === "administrator";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json(
      { error: "Permission denied. Only author or administrator can delete this comment." },
      { status: 403 }
    );
  }

  const { error } = await db.from("comments").delete().eq("id", commentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());

  if (!db || !user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const body = await request.json();
  const { commentId, action, accepted } = body;

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
  }

  const { data: comment } = await db
    .from("comments")
    .select("author_username, post_id, accepted, upvotes")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (action === "upvote") {
    const { error: upvoteErr } = await db.from("comment_upvotes").insert({
      comment_id: commentId,
      username: user.id,
    });

    if (upvoteErr && upvoteErr.code === "23505") {
      return NextResponse.json({ error: "Already upvoted this comment" }, { status: 400 });
    }

    const newUpvotes = (comment.upvotes || 0) + 1;
    const { error: updateErr } = await db.from("comments").update({ upvotes: newUpvotes }).eq("id", commentId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Award +1 point to comment author
    await addPointsToUser(comment.author_username, 1);

    return NextResponse.json({ success: true, upvotes: newUpvotes });
  }

  if (action === "toggleAccept" || accepted !== undefined) {
    // Fetch post author
    const { data: post } = await db
      .from("posts")
      .select("author_username")
      .eq("id", comment.post_id)
      .maybeSingle();

    const isPostAuthor = post?.author_username === user.id;
    const isMentor = user.role === "mentor";
    const isAdmin = user.role === "administrator";

    if (!isPostAuthor && !isMentor && !isAdmin) {
      return NextResponse.json(
        { error: "Permission denied. Mentors, Administrators, or post author can mark answers as accepted." },
        { status: 403 }
      );
    }

    const targetState = accepted !== undefined ? Boolean(accepted) : !comment.accepted;
    const { error } = await db
      .from("comments")
      .update({ accepted: targetState })
      .eq("id", commentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Award +20 points to comment author when comment is marked accepted
    if (targetState && !comment.accepted) {
      await addPointsToUser(comment.author_username, 20);
    }

    return NextResponse.json({ success: true, accepted: targetState });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
