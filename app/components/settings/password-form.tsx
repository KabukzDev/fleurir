"use client";

import { FormEvent, useState } from "react";
import { updatePassword } from "@/app/settings/actions";

export default function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const result = await updatePassword(password);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Password updated successfully.");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Something went wrong.");
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          New Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter a new password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50"
        />
      </div>

      <div>
        <label className="mb-2 ml-1 block text-xs font-medium uppercase tracking-wider text-white/70">
          Confirm Password
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm your new password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-flower-blue/50"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer rounded-xl bg-flower-blue px-6 py-3 font-medium text-white transition hover:bg-flower-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}