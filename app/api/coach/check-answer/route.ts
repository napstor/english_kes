import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type CoachIssue = {
  fragment: string;
  correction: string;
  reasonRu: string;
  grammarRu: string;
  category: "grammar" | "word_order" | "vocabulary" | "meaning" | "spelling" | "punctuation";
};

type LocalHint = {
  fragment: string;
  correction: string;
  shortRu: string;
  grammarRu: string;
  category: CoachIssue["category"];
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
      localHint?: LocalHint | null;
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
            "Ты коуч-учитель английского для взрослых русскоязычных учеников, которые осваивают английский с нуля и мыслят русской грамматической логикой. Твоя цель не просто исправить, а дать ученику короткое понимание грамматики. Объясняй по-русски ясно, спокойно и очень кратко. Сначала найди главную обучающую причину ошибки, а не поверхностную метку. Если слово похоже на неверную форму глагола, не называй это только spelling: объясни грамматический паттерн. Если передан localHint, считай его диагностикой приложения и строй shortRu, grammarMiniLessonRu и первую issue вокруг него, если он не противоречит ответу. Для ошибок вида wathes/washes после do/does объясняй: в вопросе Present Simple do/does уже несет грамматику, поэтому смысловой глагол идет в базовой форме. Для каждой существенной ошибки дай: 1) что неверно, 2) короткое правило, 3) почему русская логика сбивает, 4) правильный английский паттерн. Не пиши длинную лекцию. Одна ошибка = 1-3 коротких предложения. Фокус урока: Present Simple, do/does, he/she/it + -s, порядок слов в вопросе, место частотных наречий, отсутствие двойного отрицания, устойчивые идиомы. Не придирайся к допустимым британским/американским вариантам, артиклям или пунктуации, если они не меняют смысл текущей ПЛФ. Верни только JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            lesson: body.lessonTitle ?? "Lesson 1. Present Simple habitual actions",
            task: body.promptRu ?? "",
            userAnswer,
            acceptedAnswers,
            localHint: body.localHint ?? null,
            expectedJsonShape: {
              verdict: "correct | almost | incorrect",
              score: "number 0-100",
              bestAnswer: "best corrected English answer",
              shortRu: "one sentence: the main grammar idea the learner should understand",
              grammarMiniLessonRu: "2-4 short Russian sentences explaining the core rule behind the main mistake",
              issues: [
                {
                  fragment: "wrong fragment from user answer",
                  correction: "correct fragment",
                  reasonRu: "what is wrong in plain Russian",
                  grammarRu: "mini grammar reference: rule + why Russian logic misleads + correct English pattern",
                  category: "grammar | word_order | vocabulary | meaning | spelling | punctuation"
                }
              ],
              drillRu: "one short micro-drill instruction, e.g. repeat He watches / Does he watch / He doesn't watch"
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
      grammarMiniLessonRu?: string;
      issues?: CoachIssue[];
      drillRu?: string;
    };

    return NextResponse.json({
      verdict: parsed.verdict ?? "incorrect",
      score: parsed.score ?? 0,
      bestAnswer: parsed.bestAnswer ?? acceptedAnswers[0],
      shortRu: parsed.shortRu ?? "Проверь форму времени, порядок слов и вспомогательные глаголы.",
      grammarMiniLessonRu:
        parsed.grammarMiniLessonRu ??
        "В английском вопрос и отрицание в Present Simple обычно строятся через do/does. После does смысловой глагол идет без окончания -s.",
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
