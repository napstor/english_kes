import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type SocraticIssue = {
  line: number;
  focusRu: string;
  questionRu: string;
  hintRu: string;
  severity: "fix" | "polish";
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
    }

    const body = (await request.json()) as {
      lessonTitle?: string;
      model?: string;
      sentences?: string[];
      vocabulary?: string[];
    };
    const sentences = (body.sentences ?? []).map((sentence) => sentence.trim()).filter(Boolean);

    if (sentences.length < 1) {
      return NextResponse.json({ error: "sentences are required." }, { status: 400 });
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
            "Ты коуч-учитель английского для взрослых русскоязычных учеников. Проверяешь самостоятельные фразы по методике учебника: ученик должен сам составить 10-20 строк по образцу Present Simple: утверждение, вопрос, отрицание. Работай сократовским методом: НЕ выдавай сразу готовые исправленные предложения целиком. Дай короткую теорию, затем вопросы и точечные подсказки, чтобы ученик сам исправил. Можно показать только маленький фрагмент-паттерн, например 'Does he ...?' или 'he/she/it + V-s', но не полный ответ строки. Фокус: do/does, базовая форма после do/does, -s у he/she/it только в утверждении, порядок слов в вопросе, место always/often/never, отсутствие двойного отрицания, лексика урока. Верни только JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            lesson: body.lessonTitle ?? "Present Simple habitual actions",
            model: body.model,
            lessonVocabulary: body.vocabulary ?? [],
            studentLines: sentences.map((text, index) => ({ line: index + 1, text })),
            expectedJsonShape: {
              verdict: "ready | needs_revision",
              score: "number 0-100",
              summaryRu: "1 short sentence about overall readiness",
              theoryRu: "2-4 short Russian sentences: the core grammar idea needed to self-correct",
              issues: [
                {
                  line: "line number",
                  focusRu: "short name of the issue",
                  questionRu: "Socratic question that makes the learner notice the issue",
                  hintRu: "small hint without giving the full corrected line",
                  severity: "fix | polish"
                }
              ],
              nextActionRu: "what the learner should do now"
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
      verdict?: "ready" | "needs_revision";
      score?: number;
      summaryRu?: string;
      theoryRu?: string;
      issues?: SocraticIssue[];
      nextActionRu?: string;
    };

    return NextResponse.json({
      verdict: parsed.verdict ?? "needs_revision",
      score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))),
      summaryRu: parsed.summaryRu ?? "Проверь, что каждая строка собрана по схеме: утверждение, вопрос, отрицание.",
      theoryRu:
        parsed.theoryRu ??
        "В Present Simple вопрос и отрицание строятся через do/does. После do/does смысловой глагол возвращается в базовую форму.",
      issues: (parsed.issues ?? []).slice(0, 8),
      nextActionRu: parsed.nextActionRu ?? "Исправь отмеченные строки и отправь их на проверку еще раз."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Composition coach failed."
      },
      { status: 500 }
    );
  }
}
