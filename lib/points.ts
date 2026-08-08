import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function addPointsToUser(username: string, pointsAmount: number) {
  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());
  if (!db || !username || pointsAmount <= 0) return;

  // Fetch current user profile
  const { data: profile } = await db
    .from("profiles")
    .select("points, name")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return;

  const newPoints = (profile.points || 0) + pointsAmount;

  // Update profiles.points
  await db
    .from("profiles")
    .update({ points: newPoints })
    .eq("username", username);

  // Update or insert into league_entries
  const { data: existingEntry } = await db
    .from("league_entries")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (existingEntry) {
    await db
      .from("league_entries")
      .update({ score: newPoints })
      .eq("username", username);
  } else {
    await db.from("league_entries").insert({
      league_id: "gold-freud",
      username,
      display_name: profile.name || username,
      score: newPoints,
      collaborations: 1,
    });
  }
}
