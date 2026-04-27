import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const maxAudioSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN to the environment."
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  const profileId = String(formData.get("profileId") ?? "local-profile");
  const stepId = String(formData.get("stepId") ?? "unknown-step");

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  if (!audio.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Only audio uploads are accepted." }, { status: 400 });
  }

  if (audio.size > maxAudioSize) {
    return NextResponse.json({ error: "Audio file is too large." }, { status: 413 });
  }

  const extension = audio.type.includes("webm") ? "webm" : audio.type.includes("mp4") ? "mp4" : "audio";
  const safeProfileId = profileId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeStepId = stepId.replace(/[^a-zA-Z0-9_-]/g, "");
  const pathname = `recordings/${safeProfileId}/${safeStepId}/${Date.now()}.${extension}`;

  const blob = await put(pathname, audio, {
    access: "public",
    addRandomSuffix: true,
    contentType: audio.type
  });

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
    contentType: audio.type,
    size: audio.size
  });
}
