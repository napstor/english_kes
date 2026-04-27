import { head, put } from "@vercel/blob";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ElevenVoice = {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
  verified_languages?: Array<{
    language?: string;
    accent?: string;
    locale?: string;
  }>;
};

type VoicesResponse = {
  voices?: ElevenVoice[];
};

const elevenModelId = "eleven_v3";
const outputFormat = "mp3_44100_128";

export async function POST(request: Request) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY is not configured." }, { status: 500 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 500 });
    }

    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "text is required." }, { status: 400 });
    }

    if (text.length > 3000) {
      return NextResponse.json({ error: "Text is too long for Eleven v3." }, { status: 413 });
    }

    const voice = await chooseBritishVoice(text);
    const textHash = createHash("sha256").update(`${elevenModelId}:${voice.voice_id}:${text}`).digest("hex").slice(0, 24);
    const pathname = `tts/${elevenModelId}/${voice.voice_id}/${textHash}.mp3`;

    const cached = await findCachedAudio(pathname);
    if (cached) {
      return NextResponse.json({
        audioUrl: `/api/audio/native?pathname=${encodeURIComponent(pathname)}`,
        pathname,
        voiceId: voice.voice_id,
        voiceName: voice.name,
        cached: true
      });
    }

    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}?output_format=${outputFormat}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: elevenModelId,
          language_code: "en",
          voice_settings: {
            stability: 0.52,
            similarity_boost: 0.78,
            style: 0.18,
            use_speaker_boost: true,
            speed: 0.92
          }
        })
      }
    );

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      return NextResponse.json(
        { error: `ElevenLabs TTS failed: ${audioResponse.status} ${errorText}` },
        { status: audioResponse.status }
      );
    }

    const audio = await audioResponse.blob();
    await put(pathname, audio, {
      access: "private",
      addRandomSuffix: false,
      contentType: "audio/mpeg"
    });

    return NextResponse.json({
      audioUrl: `/api/audio/native?pathname=${encodeURIComponent(pathname)}`,
      pathname,
      voiceId: voice.voice_id,
      voiceName: voice.name,
      cached: false
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "TTS generation failed."
      },
      { status: 500 }
    );
  }
}

async function findCachedAudio(pathname: string) {
  try {
    return await head(pathname);
  } catch {
    return null;
  }
}

async function chooseBritishVoice(text: string): Promise<ElevenVoice> {
  const configuredVoiceIds = process.env.ELEVENLABS_VOICE_IDS?.split(",")
    .map((voiceId) => voiceId.trim())
    .filter(Boolean);

  if (configuredVoiceIds?.length) {
    return {
      voice_id: pickStable(configuredVoiceIds, text),
      name: "Configured voice"
    };
  }

  const britishVoices = await searchVoices("British");
  const filteredBritishVoices = britishVoices.filter(isBritishEnglishVoice);
  const candidateVoices = filteredBritishVoices.length ? filteredBritishVoices : britishVoices;

  if (candidateVoices.length) {
    return pickStable(candidateVoices, text);
  }

  const englishVoices = await searchVoices("English");
  if (englishVoices.length) {
    return pickStable(englishVoices, text);
  }

  return {
    voice_id: "JBFqnCBsd6RMkjVDRZzb",
    name: "ElevenLabs default"
  };
}

async function searchVoices(search: string) {
  const params = new URLSearchParams({
    search,
    page_size: "100",
    include_total_count: "false"
  });

  const response = await fetch(`https://api.elevenlabs.io/v2/voices?${params.toString()}`, {
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY ?? ""
    },
    next: {
      revalidate: 60 * 60
    }
  });

  if (!response.ok) return [];

  const data = (await response.json()) as VoicesResponse;
  return data.voices ?? [];
}

function isBritishEnglishVoice(voice: ElevenVoice) {
  const labels = Object.values(voice.labels ?? {}).join(" ").toLowerCase();
  const languages = (voice.verified_languages ?? [])
    .map((language) => `${language.language ?? ""} ${language.accent ?? ""} ${language.locale ?? ""}`)
    .join(" ")
    .toLowerCase();
  const combined = `${labels} ${languages}`;

  return (
    combined.includes("british") ||
    combined.includes("uk") ||
    combined.includes("england") ||
    combined.includes("en-gb")
  );
}

function pickStable<T>(items: T[], seed: string) {
  const hash = createHash("sha256").update(seed).digest();
  const index = hash.readUInt32BE(0) % items.length;
  return items[index];
}
