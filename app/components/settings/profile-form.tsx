"use client";

import { useState, FormEvent } from "react";
import { updateProfile } from "@/app/settings/actions";

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
  const [form, setForm] = useState({
    name: profile.name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    location: profile.location || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setSuccess("Profile updated successfully.");
      }
    } catch {
      setError("Something went wrong.");
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
          <p className="text-lg">{profile.name}</p>
          <p className="text-white/50">@{profile.username}</p>
          <p className="text-sm text-white/40">{profile.email}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-200">
          {success}
        </div>
      )}

      <div>
        <label className="mb-2 ml-1 block text-xs font-medium uppercase tracking-wider text-white/70">
          Display Name
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
          Username
        </label>

        <input
          type="text"
          value={form.username}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              username: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50"
        />
      </div>

      <div>
        <label className="mb-2 ml-1 block text-xs font-medium uppercase tracking-wider text-white/70">
          Bio
        </label>

        <textarea
          rows={4}
          value={form.bio}
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
          Location
        </label>

        <input
          type="text"
          value={form.location}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              location: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer rounded-xl bg-flower-blue px-6 py-3 font-medium text-white transition hover:bg-flower-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}