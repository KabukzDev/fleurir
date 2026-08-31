"use client";

import { useState, FormEvent, useEffect } from "react";
import { updateProfile } from "@/app/settings/actions";
import { useTranslation } from "@/lib/i18n/client";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

type ProfileFormProps = {
  profile: {
    image: string;
    name: string;
    username: string;
    bio: string;
    location: string;
    email: string;
  };
};

export default function ProfileForm({ profile }: ProfileFormProps) {
  const { t, setLocale } = useTranslation();

  const [form, setForm] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
    location: profile.location || "",
  });

  const [selectedLanguage, setSelectedLanguage] = useState<string>("auto");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
    const cookieVal = match ? decodeURIComponent(match[1]) : null;
    if (cookieVal === "en" || cookieVal === "es") {
      setSelectedLanguage(cookieVal);
    } else {
      setSelectedLanguage("auto");
    }
  }, []);

  const handleLanguageChange = (val: string) => {
    setSelectedLanguage(val);
    if (val === "en" || val === "es") {
      setLocale(val as Locale);
    } else {
      setLocale("auto");
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateProfile(form);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(t("settings.profileUpdated"));
      }
    } catch {
      setError(t("common.errorGeneric"));
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <img
          src={profile.image}
          alt={profile.name}
          className="h-24 w-24 rounded-full object-cover border border-white/10"
        />

        <div>
          <p className="text-lg font-medium">{profile.name}</p>
          <p className="text-white/50">@{profile.username}</p>
          <p className="text-sm text-white/40">{profile.email}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-200 text-sm">
          {success}
        </div>
      )}

      {/* Language Preference Selector */}
      <div>
        <label className="mb-2 ml-1 block text-xs font-medium uppercase tracking-wider text-white/70">
          {t("settings.languageLabel")}
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-flower-blue/50 cursor-pointer"
        >
          <option value="auto" className="bg-mist-950 text-white">
            {t("settings.languageAuto")}
          </option>
          <option value="en" className="bg-mist-950 text-white">
            {t("settings.languageEn")}
          </option>
          <option value="es" className="bg-mist-950 text-white">
            {t("settings.languageEs")}
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 ml-1 block text-xs font-medium uppercase tracking-wider text-white/70">
          {t("settings.displayNameLabel")}
        </label>

        <input
          type="text"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50"
        />
      </div>

      <div>
        <label className="mb-2 ml-1 block text-xs font-medium uppercase tracking-wider text-white/70">
          {t("settings.bioLabel")}
        </label>

        <textarea
          rows={4}
          value={form.bio}
          placeholder={t("settings.bioPlaceholder")}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              bio: event.target.value,
            }))
          }
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50"
        />
      </div>

      <div>
        <label className="mb-2 ml-1 block text-xs font-medium uppercase tracking-wider text-white/70">
          {t("settings.locationLabel")}
        </label>

        <input
          type="text"
          value={form.location}
          placeholder={t("settings.locationPlaceholder")}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              location: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-flower-blue px-6 py-3 font-medium text-white transition hover:bg-flower-blue/90 disabled:opacity-50 cursor-pointer"
        >
          {saving ? t("common.saving") : t("settings.saveChanges")}
        </button>
      </div>
    </form>
  );
}