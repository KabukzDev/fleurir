"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ProfileData = {
  name: string;
  username: string;
  bio: string;
  location: string;
};

function normalizeUsername(username: string) {
  return username.trim().toLowerCase().replace(/^@/, "");
}

export async function updateProfile(profile: ProfileData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Supabase is not configured.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  const username = normalizeUsername(profile.username);

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      error: "Username must be 3-20 lowercase characters.",
    };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("auth_user_id")
    .eq("username", username)
    .maybeSingle();

  if (
    existingProfile &&
    existingProfile.auth_user_id !== user.id
  ) {
    return {
      error: "That username is already taken.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: profile.name.trim(),
      username,
      bio: profile.bio.trim(),
      location: profile.location.trim(),
    })
    .eq("auth_user_id", user.id);

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function updatePassword(password: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Supabase is not configured.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      error: "Supabase is not configured.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in.",
    };
  }

  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return {
      error: "No file uploaded.",
    };
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      error: "Only PNG, JPG and WEBP images are allowed.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      error: "Image must be under 5MB.",
    };
  }

    const filePath = user.id;

    const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
        upsert: true,
    });

  if (uploadError) {
    return {
      error: uploadError.message,
    };
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = data.publicUrl;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      image: avatarUrl,
    })
    .eq("auth_user_id", user.id);

  if (profileError) {
    return {
      error: profileError.message,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/profile");

  return {
    success: true,
    image: avatarUrl,
  };
}