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
    const pronunciation = await assessPronunciation(expectedText, transcription.text ?? "", transcription.error ?? "");

    return NextResponse.json({
      url: blob.url,
      audioUrl: `/api/audio/native?pathname=${encodeURIComponent(blob.pathname)}`,
      pathname: blob.pathname,
      contentType: audio.type,
      size: audio.size,
      transcription,
      pronunciation
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

async function assessPronunciation(expectedText: string, transcript: string, transcriptionError: string) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      score: 0,
      nativeImpressionRu: "OPENAI_API_KEY is not configured.",
      summaryRu: "",
      issues: [],
      drillRu: ""
    };
  }

  if (!expectedText.trim() || (!transcript.trim() && transcriptionError)) {
    return {
      score: 0,
      nativeImpressionRu: "Пока не удалось оценить произношение: распознавание речи не прошло.",
      summaryRu: transcriptionError,
      issues: [],
      drillRu: "Запиши фразу еще раз в тихом месте, ближе к микрофону."
    };
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Ты тренер по английскому произношению для взрослых русскоязычных. Оценивай понятно и бережно, но прямо. У тебя есть эталонная фраза и результат распознавания речи ученика. Это не полный фонетический анализ аудио, а оценка разборчивости и вероятных грубых проблем по тому, что распознал STT. Не обещай точность фонетической лаборатории. Фокус: понятность для носителя, пропущенные/искаженные слова, окончания, связность, ритм фразы, частые русские проблемы: th, w/v, r, короткие/долгие гласные, окончания -s/-ed, редукция служебных слов. Верни только JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            expectedText,
            recognizedSpeech: transcript,
            expectedJsonShape: {
              score: "number 0-100",
              nativeImpressionRu: "1 sentence: how this likely sounds to a native speaker",
              summaryRu: "1-2 short sentences with the main pronunciation takeaway",
              issues: [
                {
                  titleRu: "short issue title",
                  evidenceRu: "what in the recognized speech suggests this",
                  fixRu: "specific pronunciation fix in Russian",
                  drillRu: "short repeat drill"
                }
              ],
              drillRu: "one focused drill for the next recording"
            }
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("Pronunciation coach returned an empty response.");
    const parsed = JSON.parse(content) as {
      score?: number;
      nativeImpressionRu?: string;
      summaryRu?: string;
      issues?: Array<{
        titleRu?: string;
        evidenceRu?: string;
        fixRu?: string;
        drillRu?: string;
      }>;
      drillRu?: string;
    };

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))),
      nativeImpressionRu: parsed.nativeImpressionRu ?? "Речь в целом можно оценить по совпадению с распознанным текстом.",
      summaryRu: parsed.summaryRu ?? "",
      issues: (parsed.issues ?? []).slice(0, 3).map((issue) => ({
        titleRu: issue.titleRu ?? "Что поправить",
        evidenceRu: issue.evidenceRu ?? "",
        fixRu: issue.fixRu ?? "",
        drillRu: issue.drillRu ?? ""
      })),
      drillRu: parsed.drillRu ?? "Повтори фразу медленно, затем в обычном темпе."
    };
  } catch (error) {
    return {
      score: 0,
      nativeImpressionRu: "Произносительный разбор сейчас не прошел.",
      summaryRu: error instanceof Error ? error.message : "Pronunciation assessment failed.",
      issues: [],
      drillRu: "Сравни свою запись с эталоном и повтори фразу еще раз."
    };
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
