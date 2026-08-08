import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addPointsToUser } from "@/lib/points";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ comments: [] });
  }

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, author_username, content, upvotes, accepted, created_at, comment_replies(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const comments = (data || []).map((c) => ({
    id: c.id,
    author: c.author_username,
    content: c.content,
    upvotes: c.upvotes,
    accepted: c.accepted,
    createdAt: c.created_at,
    replies: (c.comment_replies || []).map((r: { id: string; author_username: string; content: string }) => ({
      id: r.id,
      author: r.author_username,
      content: r.content,
    })),
  }));

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const body = await request.json();
  const content = String(body.content || "").trim();

  if (!content) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: body.postId,
      author_username: user.id,
      content,
    })
    .select("id, author_username, content, upvotes, accepted")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    comment: {
      id: data.id,
      author: data.author_username,
      content: data.content,
      upvotes: data.upvotes,
      accepted: data.accepted,
      replies: [],
    },
  });
}

export async function DELETE(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  if (!supabase || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get("id");

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
  }

  const { data: comment } = await supabase
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

  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  if (!supabase || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { commentId, action, accepted } = body;

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
  }

  const { data: comment } = await supabase
    .from("comments")
    .select("author_username, post_id, accepted, upvotes")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (action === "upvote") {
    const { error: upvoteErr } = await supabase.from("comment_upvotes").insert({
      comment_id: commentId,
      username: user.id,
    });

    if (upvoteErr && upvoteErr.code === "23505") {
      return NextResponse.json({ error: "Already upvoted this comment" }, { status: 400 });
    }

    const newUpvotes = (comment.upvotes || 0) + 1;
    await supabase.from("comments").update({ upvotes: newUpvotes }).eq("id", commentId);

    // Award +1 point to comment author
    await addPointsToUser(comment.author_username, 1);

    return NextResponse.json({ success: true, upvotes: newUpvotes });
  }

  if (action === "toggleAccept" || accepted !== undefined) {
    // Fetch post author
    const { data: post } = await supabase
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
    const { error } = await supabase
      .from("comments")
      .update({ accepted: targetState })
      .eq("id", commentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Award +15 points to comment author when comment is marked accepted
    if (targetState && !comment.accepted) {
      await addPointsToUser(comment.author_username, 15);
    }

    return NextResponse.json({ success: true, accepted: targetState });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
