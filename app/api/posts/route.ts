import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { addPointsToUser } from "@/lib/points";

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

  const body = await request.json();
  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
    : [];

  const { data, error } = await db
    .from("posts")
    .insert({
      community_slug: body.communitySlug,
      title: String(body.title || "").trim(),
      type: body.type === "discussion" ? "discussion" : "question",
      content: String(body.content || "").trim(),
      author_username: user.id,
      tags,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());

  if (!db || !user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("id");

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  const { data: post } = await db
    .from("posts")
    .select("author_username")
    .eq("id", postId)
    .maybeSingle();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const isAuthor = post.author_username === user.id;
  const isAdmin = user.role === "administrator";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "Permission denied. Only author or administrator can delete this post." }, { status: 403 });
  }

  const { error } = await db.from("posts").delete().eq("id", postId);

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
  const { postId, action, solved } = body;

  if (!postId) {
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });
  }

  const { data: post } = await db
    .from("posts")
    .select("author_username, solved, upvotes")
    .eq("id", postId)
    .maybeSingle();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (action === "upvote") {
    // Upvote system (Reddit-like)
    const { error: upvoteErr } = await db.from("post_upvotes").insert({
      post_id: postId,
      username: user.id,
    });

    if (upvoteErr && upvoteErr.code === "23505") {
      return NextResponse.json({ error: "Already upvoted this post" }, { status: 400 });
    }

    const newUpvotes = (post.upvotes || 0) + 1;
    const { error: updateErr } = await db.from("posts").update({ upvotes: newUpvotes }).eq("id", postId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Award +1 point to author
    await addPointsToUser(post.author_username, 1);

    return NextResponse.json({ success: true, upvotes: newUpvotes });
  }

  if (action === "toggleSolve" || solved !== undefined) {
    const isAuthor = post.author_username === user.id;
    const isMentor = user.role === "mentor";
    const isAdmin = user.role === "administrator";

    if (!isAuthor && !isMentor && !isAdmin) {
      return NextResponse.json(
        { error: "Permission denied. Mentors, Administrators, or author can mark post as solved." },
        { status: 403 }
      );
    }

    const targetSolvedState = solved !== undefined ? Boolean(solved) : !post.solved;
    const { error } = await db
      .from("posts")
      .update({ solved: targetSolvedState })
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Award +15 points to post author when marked solved
    if (targetSolvedState && !post.solved) {
      await addPointsToUser(post.author_username, 15);
    }

    return NextResponse.json({ success: true, solved: targetSolvedState });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
