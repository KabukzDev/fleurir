import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getPendingFriendRequests } from "@/lib/demo-social";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ requests: [] });
  }

  const requests = await getPendingFriendRequests(user.id);
  return NextResponse.json({ requests });
}

// Accept friend request
export async function POST(request: Request) {
  const [user, supabase] = await Promise.all([
    getUser(),
    createSupabaseServerClient(),
  ]);

  const db = createSupabaseAdminClient() || supabase;

  if (!db || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { senderUsername } = await request.json();
  if (!senderUsername) {
    return NextResponse.json({ error: "Sender username required" }, { status: 400 });
  }

  // 1. Update request status to accepted
  await db
    .from("friends")
    .update({ status: "accepted" })
    .eq("user_username", senderUsername)
    .eq("friend_username", user.id);

  // 2. Insert reciprocal row for mutual friendship
  await db.from("friends").upsert({
    user_username: user.id,
    friend_username: senderUsername,
    status: "accepted",
  });

  return NextResponse.json({ success: true, status: "accepted" });
}

// Decline friend request
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
  const senderUsername = searchParams.get("senderUsername");

  if (!senderUsername) {
    return NextResponse.json({ error: "Sender username required" }, { status: 400 });
  }

  await db
    .from("friends")
    .delete()
    .eq("user_username", senderUsername)
    .eq("friend_username", user.id);

  return NextResponse.json({ success: true, status: "none" });
}
