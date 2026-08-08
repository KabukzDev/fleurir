import { google } from "googleapis";
import { Readable } from "stream";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function uploadFileToGoogleDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    try {
      // Format private key correctly if escaped
      privateKey = privateKey.replace(/\\n/g, "\n");

      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });

      const drive = google.drive({ version: "v3", auth });

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "1FG6JHc3fx1-JqxDXOv_oP4HAsJzzDqwZ";

      // Upload file directly into user's Google Drive folder/Shared Drive
      const fileResponse = await drive.files.create({
        supportsAllDrives: true,
        supportsTeamDrives: true,
        requestBody: {
          name: fileName,
          mimeType,
          parents: [folderId],
        },
        media: {
          mimeType,
          body: stream,
        },
        fields: "id, webViewLink, webContentLink",
      });

      const fileId = fileResponse.data.id;
      if (fileId) {
        // Set file permissions to public read so anyone with the link can view/download
        await drive.permissions.create({
          fileId,
          supportsAllDrives: true,
          supportsTeamDrives: true,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });

        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    } catch (gdriveErr: any) {
      console.warn("Google Drive upload quota error, falling back to cloud storage:", gdriveErr?.message);
    }
  }

  // Fallback to Supabase Cloud Storage if Google Drive personal account quota is restricted
  const db = createSupabaseAdminClient() || (await createSupabaseServerClient());
  if (!db) {
    throw new Error("Cloud storage client unavailable.");
  }

  const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  // Ensure storage bucket exists or upload to default bucket
  const { data: uploadData, error: uploadError } = await db.storage
    .from("attachments")
    .upload(cleanFileName, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    // If bucket doesn't exist yet, return data URL as safe inline fallback
    const base64Data = buffer.toString("base64");
    return `data:${mimeType};name=${encodeURIComponent(fileName)};base64,${base64Data}`;
  }

  const { data: publicUrlData } = db.storage
    .from("attachments")
    .getPublicUrl(uploadData.path);

  return publicUrlData.publicUrl;
}
