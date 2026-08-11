import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());
  if (!db) {
    return NextResponse.json(
      { error: "Database client unavailable." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { fileName, fileType, fileSize } = body;

  if (!fileName || !fileType) {
    return NextResponse.json(
      { error: "fileName and fileType are required." },
      { status: 400 }
    );
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit
  if (fileSize && Number(fileSize) > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 20MB limit." },
      { status: 400 }
    );
  }

  try {
    // Auto-provision public 'attachments' storage bucket if it doesn't exist yet
    const { data: buckets } = await db.storage.listBuckets();
    if (!buckets?.some((b) => b.name === "attachments")) {
      await db.storage.createBucket("attachments", { public: true });
    }

    const cleanName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${Date.now()}_${cleanName}`;

    // Create pre-signed upload URL from Supabase Storage
    const { data, error } = await db.storage
      .from("attachments")
      .createSignedUploadUrl(storagePath);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: `Pre-signed URL generation failed: ${error?.message || "Storage error"}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = db.storage
      .from("attachments")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: storagePath,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Storage Error: ${err?.message || "Failed to prepare upload"}` },
      { status: 500 }
    );
  }
}
