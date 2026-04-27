import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const maxAudioSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
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
    const expectedText = String(formData.get("expectedText") ?? "");

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
      access: "private",
      addRandomSuffix: true,
      contentType: audio.type
    });

    const transcription = await transcribeAudio(audio, expectedText);

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: audio.type,
      size: audio.size,
      transcription
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error.";
    return NextResponse.json(
      {
        error: `Audio upload failed: ${message}`
      },
      { status: 500 }
    );
  }
}

async function transcribeAudio(audio: File, expectedText: string) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      text: "",
      error: "OPENAI_API_KEY is not configured."
    };
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "gpt-4o-mini-transcribe",
      language: "en",
      prompt: expectedText || undefined
    });

    return {
      text: transcription.text ?? "",
      error: ""
    };
  } catch (error) {
    return {
      text: "",
      error: error instanceof Error ? error.message : "Transcription failed."
    };
  }
}
