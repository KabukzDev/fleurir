import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import AvatarUpload from "../components/settings/avatar-upload";
import ProfileForm from "../components/settings/profile-form";
import PasswordForm from "../components/settings/password-form";

export default async function SettingsPage() {
  const [supabase, locale] = await Promise.all([
    createSupabaseServerClient(),
    getLocale(),
  ]);

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const dictionary = getDictionary(locale);

  if (error || !profile) {
    return (
      <main className="min-h-screen px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-2xl font-light">Profile not found</h1>
            <p className="mt-2 text-white/60">
              We couldn't load your account settings.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-4xl font-light">{dictionary.settings.title}</h1>
          <p className="mt-2 text-white/50">
            {dictionary.settings.subtitle}
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-6 text-2xl font-light">
            {dictionary.settings.profileInfo}
          </h2>
          <div className="mb-8">
            <ProfileForm
              profile={{
                image: profile.image,
                name: profile.name,
                username: profile.username,
                bio: profile.bio,
                location: profile.location,
                email: profile.email,
              }}
            />
          </div>
          
          <AvatarUpload
            image={profile.image}
            name={profile.name}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-6 text-2xl font-light">
            {dictionary.settings.passwordSecurity}
          </h2>

          <PasswordForm />
        </section>
      </div>
    </main>
  );
}