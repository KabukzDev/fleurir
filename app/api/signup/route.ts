import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/^@/, "");
}

export async function POST(request: Request) {
  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();

  if (!admin || !supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const username = normalizeUsername(body.username || "");
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || username || "New user").trim();

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-20 lowercase characters." },
      { status: 400 }
    );
  }

  if (!email || password.length < 6) {
    return NextResponse.json(
      { error: "Use a valid email and a password with at least 6 characters." },
      { status: 400 }
    );
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      { error: "That username is already taken." },
      { status: 409 }
    );
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, name },
    });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "Could not create account." },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    username,
    auth_user_id: created.user.id,
    image: "/testing/anna_test.png",
    name,
    email,
    role: "member",
    bio: "New Fleurir learner.",
    location: "",
    points: 0,
    interests: [],
    is_online: true,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);

    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  await supabase.auth.signInWithPassword({ email, password });

  return NextResponse.json({ ok: true, username });
}
