import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, image, name, email, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      id: user.id,
      image: "/testing/anna_test.png",
      name: user.email || "User",
      email: user.email || "",
      role: "user",
    };
  }

  return {
    id: profile.username,
    image: profile.image,
    name: profile.name,
    email: profile.email,
    role: profile.role,
  };
}
