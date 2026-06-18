"use client";

import { ChangeEvent, useState } from "react";
import { uploadAvatar } from "@/app/settings/actions";

type AvatarUploadProps = {
  image: string;
  name: string;
};

export default function AvatarUpload({
  image,
  name,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState(image);
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Images must be under 5MB.");
      return;
    }

    setError("");
    setSuccess("");
    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select an image.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const result = await uploadAvatar(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Avatar updated successfully.");
      }
    } catch {
      setError("Failed to upload avatar.");
    }

    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        <img
          src={preview}
          alt={name}
          className="h-24 w-24 rounded-full border border-white/10 object-cover"
        />

        <div className="space-y-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="block text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/20"
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="cursor-pointer rounded-xl bg-flower-blue px-4 py-2 text-white transition hover:bg-flower-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Avatar"}
          </button>
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

      <p className="text-sm text-white/40">
        PNG, JPG or WEBP. Maximum size: 5MB.
      </p>
    </div>
  );
}