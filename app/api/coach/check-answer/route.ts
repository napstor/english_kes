import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type CoachIssue = {
  fragment: string;
  correction: string;
  reasonRu: string;
  category: "grammar" | "word_order" | "vocabulary" | "meaning" | "spelling" | "punctuation";
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
    }

    const body = (await request.json()) as {
      promptRu?: string;
      userAnswer?: string;
      acceptedAnswers?: string[];
      lessonTitle?: string;
    };

    const userAnswer = body.userAnswer?.trim();
    const acceptedAnswers = body.acceptedAnswers?.filter(Boolean) ?? [];

    if (!userAnswer || !acceptedAnswers.length) {
      return NextResponse.json({ error: "userAnswer and acceptedAnswers are required." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Ты строгий, но ясный коуч-учитель английского для взрослых русскоязычных учеников, которые осваивают английский с нуля и мыслят русской грамматической логикой. Объясняй по-русски максимально понятно, без длинной теории. Фокус: смысл, Present Simple, do/does, порядок слов, частотные наречия, окончание -s, отсутствие двойного отрицания. Не придирайся к допустимым британским/американским вариантам, если смысл и грамматика корректны. Верни только JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            lesson: body.lessonTitle ?? "Lesson 1. Present Simple habitual actions",
            task: body.promptRu ?? "",
            userAnswer,
            acceptedAnswers,
            expectedJsonShape: {
              verdict: "correct | almost | incorrect",
              score: "number 0-100",
              bestAnswer: "best corrected English answer",
              shortRu: "one concise Russian explanation",
              issues: [
                {
                  fragment: "wrong fragment from user answer",
                  correction: "correct fragment",
                  reasonRu: "simple Russian reason",
                  category: "grammar | word_order | vocabulary | meaning | spelling | punctuation"
                }
              ],
              drillRu: "one short instruction for what to repeat next"
            }
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      return NextResponse.json({ error: "Coach returned an empty response." }, { status: 500 });
    }

    const parsed = JSON.parse(content) as {
      verdict?: "correct" | "almost" | "incorrect";
      score?: number;
      bestAnswer?: string;
      shortRu?: string;
      issues?: CoachIssue[];
      drillRu?: string;
    };

    return NextResponse.json({
      verdict: parsed.verdict ?? "incorrect",
      score: parsed.score ?? 0,
      bestAnswer: parsed.bestAnswer ?? acceptedAnswers[0],
      shortRu: parsed.shortRu ?? "Проверь форму времени, порядок слов и вспомогательные глаголы.",
      issues: parsed.issues ?? [],
      drillRu: parsed.drillRu ?? "Повтори правильный вариант медленно вслух."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Coach check failed."
      },
      { status: 500 }
    );
  }
}
