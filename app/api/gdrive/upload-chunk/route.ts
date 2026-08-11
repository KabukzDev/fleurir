import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const uploadUrl = formData.get("uploadUrl") as string;
    const contentRange = formData.get("contentRange") as string;
    const chunkFile = formData.get("chunk") as File | null;

    if (!uploadUrl || !chunkFile || !contentRange) {
      return NextResponse.json(
        { error: "uploadUrl, chunk file, and contentRange are required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await chunkFile.arrayBuffer());

    // Forward the 3MB chunk directly server-to-server to Google Drive (Zero CORS issues!)
    const driveRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": buffer.length.toString(),
        "Content-Range": contentRange,
      },
      body: buffer,
    });

    // 308 Resume Incomplete means chunk uploaded successfully, ready for next chunk
    if (driveRes.status === 308) {
      return NextResponse.json({ status: "incomplete" });
    }

    // 200 or 201 means final chunk received and file upload completed!
    if (driveRes.ok) {
      const driveData = await driveRes.json();
      const fileId = driveData.id;
      return NextResponse.json({ status: "complete", fileId });
    }

    const errText = await driveRes.text();
    return NextResponse.json(
      { error: `Google Drive Chunk Error (${driveRes.status}): ${errText.slice(0, 150)}` },
      { status: driveRes.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Chunk Stream Error: ${err?.message || "Internal error"}` },
      { status: 500 }
    );
  }
}
