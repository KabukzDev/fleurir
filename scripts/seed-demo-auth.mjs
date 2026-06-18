import { createClient } from "@supabase/supabase-js";

const DEMO_PASSWORD = "demo1234";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("username, email, name, auth_user_id");

  if (error) {
    console.error("Could not load profiles:", error.message);
    process.exit(1);
  }

  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const profile of profiles || []) {
    if (profile.auth_user_id) {
      skipped += 1;
      continue;
    }

    const { data: createdUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: profile.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { username: profile.username, name: profile.name },
      });

    if (createError || !createdUser.user) {
      const { data: listedUsers } = await supabase.auth.admin.listUsers();
      const existing = listedUsers?.users.find(
        (user) => user.email?.toLowerCase() === profile.email.toLowerCase()
      );

      if (!existing) {
        console.error(`Failed ${profile.username}: ${createError?.message}`);
        continue;
      }

      const { error: linkError } = await supabase
        .from("profiles")
        .update({ auth_user_id: existing.id })
        .eq("username", profile.username);

      if (linkError) {
        console.error(`Could not link ${profile.username}: ${linkError.message}`);
        continue;
      }

      linked += 1;
      console.log(`Linked existing auth user for ${profile.username}`);
      continue;
    }

    const { error: linkError } = await supabase
      .from("profiles")
      .update({ auth_user_id: createdUser.user.id })
      .eq("username", profile.username);

    if (linkError) {
      console.error(`Could not link ${profile.username}: ${linkError.message}`);
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      continue;
    }

    created += 1;
    console.log(`Created auth user for ${profile.username}`);
  }

  console.log(
    `Done. Created ${created}, linked ${linked}, skipped ${skipped} already-linked profiles.`
  );
  console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
}

main();
