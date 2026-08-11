import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { google } from "googleapis";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "1FG6JHc3fx1-JqxDXOv_oP4HAsJzzDqwZ";

  const body = await request.json();
  const { fileName, mimeType, fileSize } = body;

  try {
    let accessToken: string | null = null;

    // Method 1: OAuth Delegation (User Refresh Token - Consumes 5TB User Account Quota)
    if (refreshToken && clientId && clientSecret) {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const tokenRes = await oauth2Client.getAccessToken();
      accessToken = tokenRes.token || null;
    } else if (clientEmail && privateKey) {
      // Method 2: Service Account JWT
      privateKey = privateKey.replace(/\\n/g, "\n");
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });
      const tokens = await auth.authorize();
      accessToken = tokens.access_token || null;
    }

    if (!accessToken) {
      return NextResponse.json({ fallbackSupabase: true });
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
    };

    if (fileSize) {
      headers["X-Upload-Content-Length"] = fileSize.toString();
    }

    // Request Google Drive API for a direct resumable upload session URL
    const initRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: fileName,
          mimeType,
          parents: [folderId],
        }),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      if (errText.includes("storageQuotaExceeded") || initRes.status === 403) {
        // Fall back to Supabase Cloud Storage if Service Account has no quota on personal drive
        return NextResponse.json({ fallbackSupabase: true });
      }
      return NextResponse.json(
        { error: `Google Drive Session Error (${initRes.status}): ${errText}` },
        { status: initRes.status }
      );
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      return NextResponse.json({ fallbackSupabase: true });
    }

    return NextResponse.json({ uploadUrl, accessToken });
  } catch (err: any) {
    return NextResponse.json({ fallbackSupabase: true });
  }
}
