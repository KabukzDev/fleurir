import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { google } from "googleapis";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "1FG6JHc3fx1-JqxDXOv_oP4HAsJzzDqwZ";

  if (!clientEmail || !privateKey) {
    return NextResponse.json(
      { error: "Google Drive API credentials not configured in .env" },
      { status: 500 }
    );
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  const body = await request.json();
  const { fileName, mimeType } = body;

  if (!fileName || !mimeType) {
    return NextResponse.json(
      { error: "fileName and mimeType are required." },
      { status: 400 }
    );
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const tokens = await auth.authorize();
    const accessToken = tokens.access_token;

    // Request Google Drive API for a direct resumable upload session URL
    const initRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": mimeType,
        },
        body: JSON.stringify({
          name: fileName,
          mimeType,
          parents: [folderId],
        }),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      return NextResponse.json(
        { error: `Google Drive Session Error (${initRes.status}): ${errText}` },
        { status: initRes.status }
      );
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "Google Drive did not return a valid upload location." },
        { status: 500 }
      );
    }

    return NextResponse.json({ uploadUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Google Drive Auth Error: ${err?.message || "Authentication failed"}` },
      { status: 500 }
    );
  }
}
