import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function addPointsToUser(username: string, pointsAmount: number) {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !username || pointsAmount <= 0) return;

  // Fetch current user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("points, name")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return;

  const newPoints = (profile.points || 0) + pointsAmount;

  // Update profiles.points
  await supabase
    .from("profiles")
    .update({ points: newPoints })
    .eq("username", username);

  // Update or insert into league_entries
  // Fetch existing league entry for user
  const { data: existingEntry } = await supabase
    .from("league_entries")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (existingEntry) {
    await supabase
      .from("league_entries")
      .update({ score: newPoints })
      .eq("username", username);
  } else {
    // Pick default league (e.g. gold-freud or first available)
    await supabase.from("league_entries").insert({
      league_id: "gold-freud",
      username,
      display_name: profile.name || username,
      score: newPoints,
      collaborations: 1,
    });
  }
}
