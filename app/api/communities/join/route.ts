import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const { communitySlug } = await request.json();
  if (!communitySlug) {
    return NextResponse.json({ error: "Community slug required." }, { status: 400 });
  }

  const { error } = await supabase.from("community_members").insert({
    community_slug: communitySlug,
    username: user.id,
  });

  if (error && error.code !== "23505") { // Ignore unique constraint violation
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, joined: true });
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
  const communitySlug = searchParams.get("communitySlug");

  if (!communitySlug) {
    return NextResponse.json({ error: "Community slug required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_slug", communitySlug)
    .eq("username", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, joined: false });
}
