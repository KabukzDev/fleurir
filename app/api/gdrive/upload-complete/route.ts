import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { google } from "googleapis";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  const body = await request.json();
  const { fileId } = body;

  if (!fileId) {
    return NextResponse.json({ error: "fileId is required." }, { status: 400 });
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    try {
      privateKey = privateKey.replace(/\\n/g, "\n");
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });

      const drive = google.drive({ version: "v3", auth });

      // Grant public view permissions to uploaded file in Google Drive
      await drive.permissions.create({
        fileId,
        supportsAllDrives: true,
        supportsTeamDrives: true,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
    } catch (permErr: any) {
      console.warn("Could not set public permissions on Google Drive file:", permErr?.message);
    }
  }

  const attachmentUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
  return NextResponse.json({ attachmentUrl });
}
