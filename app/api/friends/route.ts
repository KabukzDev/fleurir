import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  if (!supabase || !user) {
    return NextResponse.json({ friends: [] });
  }

  const { data, error } = await supabase
    .from("friends")
    .select("friend_username")
    .eq("user_username", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ friends: (data || []).map((f) => f.friend_username) });
}

export async function POST(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const { friendUsername } = await request.json();
  if (!friendUsername || friendUsername === user.id) {
    return NextResponse.json({ error: "Invalid friend username." }, { status: 400 });
  }

  // Insert two-way friendship or simple friend row
  const { error: err1 } = await supabase.from("friends").insert({
    user_username: user.id,
    friend_username: friendUsername,
    status: "accepted",
  });

  const { error: err2 } = await supabase.from("friends").insert({
    user_username: friendUsername,
    friend_username: user.id,
    status: "accepted",
  });

  if (err1 && err1.code !== "23505") {
    return NextResponse.json({ error: err1.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, isFriend: true });
}

export async function DELETE(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const friendUsername = searchParams.get("friendUsername");

  if (!friendUsername) {
    return NextResponse.json({ error: "Friend username required." }, { status: 400 });
  }

  await Promise.all([
    supabase
      .from("friends")
      .delete()
      .eq("user_username", user.id)
      .eq("friend_username", friendUsername),
    supabase
      .from("friends")
      .delete()
      .eq("user_username", friendUsername)
      .eq("friend_username", user.id),
  ]);

  return NextResponse.json({ success: true, isFriend: false });
}
