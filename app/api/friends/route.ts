import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  if (!supabase || !user) {
    return NextResponse.json({ friends: [], status: "none" });
  }

  const { searchParams } = new URL(request.url);
  const targetUsername = searchParams.get("targetUsername");

  if (targetUsername) {
    const { data } = await supabase
      .from("friends")
      .select("user_username, friend_username, status")
      .or(
        `and(user_username.eq.${user.id},friend_username.eq.${targetUsername}),and(user_username.eq.${targetUsername},friend_username.eq.${user.id})`
      );

    if (!data || data.length === 0) {
      return NextResponse.json({ status: "none" });
    }

    const accepted = data.find((r) => r.status === "accepted");
    if (accepted) return NextResponse.json({ status: "accepted" });

    const sentByMe = data.find(
      (r) => r.user_username === user.id && r.status === "pending"
    );
    if (sentByMe) return NextResponse.json({ status: "pending_sent" });

    const receivedByMe = data.find(
      (r) => r.friend_username === user.id && r.status === "pending"
    );
    if (receivedByMe) return NextResponse.json({ status: "pending_received" });

    return NextResponse.json({ status: "none" });
  }

  const { data } = await supabase
    .from("friends")
    .select("friend_username")
    .eq("user_username", user.id)
    .eq("status", "accepted");

  return NextResponse.json({ friends: (data || []).map((f) => f.friend_username) });
}

export async function POST(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  const db = createSupabaseAdminClient() || supabase;

  if (!db || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendUsername } = await request.json();
  if (!friendUsername || friendUsername === user.id) {
    return NextResponse.json({ error: "Invalid friend username." }, { status: 400 });
  }

  // Insert pending request
  const { error } = await db.from("friends").insert({
    user_username: user.id,
    friend_username: friendUsername,
    status: "pending",
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, status: "pending_sent" });
}

export async function DELETE(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  const db = createSupabaseAdminClient() || supabase;

  if (!db || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const friendUsername = searchParams.get("friendUsername");

  if (!friendUsername) {
    return NextResponse.json({ error: "Friend username required." }, { status: 400 });
  }

  await Promise.all([
    db
      .from("friends")
      .delete()
      .eq("user_username", user.id)
      .eq("friend_username", friendUsername),
    db
      .from("friends")
      .delete()
      .eq("user_username", friendUsername)
      .eq("friend_username", user.id),
  ]);

  return NextResponse.json({ success: true, status: "none" });
}
