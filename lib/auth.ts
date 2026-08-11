import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const db = admin || supabase;

  // 1. Try matching by auth_user_id
  let { data: profile } = await db
    .from("profiles")
    .select("username, image, name, email, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // 2. Fallback to matching by email
  if (!profile && user.email) {
    const { data: profileByEmail } = await db
      .from("profiles")
      .select("username, image, name, email, role")
      .eq("email", user.email)
      .maybeSingle();
    profile = profileByEmail;

    // Link auth_user_id if found
    if (profile && admin) {
      await admin.from("profiles").update({ auth_user_id: user.id }).eq("username", profile.username);
    }
  }

  // 3. Fallback to matching by user_metadata.username
  if (!profile && user.user_metadata?.username) {
    const { data: profileByMeta } = await db
      .from("profiles")
      .select("username, image, name, email, role")
      .eq("username", user.user_metadata.username)
      .maybeSingle();
    profile = profileByMeta;

    if (profile && admin) {
      await admin.from("profiles").update({ auth_user_id: user.id }).eq("username", profile.username);
    }
  }

  if (!profile) {
    return null;
  }

  return {
    id: profile.username,
    username: profile.username,
    image: profile.image,
    name: profile.name,
    email: profile.email,
    role: profile.role,
  };
}
