import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { ensureSchema, getSql } from "@/lib/server/db";

export const runtime = "nodejs";

type ProgressPayload = {
  lessonId?: string;
  activeStep?: number;
  completedSteps?: number[];
  attempts?: Record<string, number>;
  score?: number;
};

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId") ?? "lesson-01";
    await ensureSchema();
    const sql = getSql();
    const rows = await sql<
      Array<{
        active_step: number;
        completed_steps: number[];
        attempts: Record<string, number>;
        score: number;
      }>
    >`
      select active_step, completed_steps, attempts, score
      from user_progress
      where user_id = ${user.id}
        and lesson_id = ${lessonId}
      limit 1
    `;

    const row = rows[0];
    return NextResponse.json({
      progress: row
        ? {
            activeStep: row.active_step,
            completedSteps: row.completed_steps,
            attempts: row.attempts,
            score: row.score
          }
        : null
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not load progress."
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = (await request.json()) as ProgressPayload;
    const lessonId = body.lessonId ?? "lesson-01";
    const activeStep = Number.isFinite(body.activeStep) ? Number(body.activeStep) : 0;
    const completedSteps = Array.isArray(body.completedSteps) ? body.completedSteps : [];
    const attempts = body.attempts ?? {};
    const score = Number.isFinite(body.score) ? Number(body.score) : 0;

    await ensureSchema();
    const sql = getSql();

    await sql`
      insert into user_progress (user_id, lesson_id, active_step, completed_steps, attempts, score, updated_at)
      values (${user.id}, ${lessonId}, ${activeStep}, ${JSON.stringify(completedSteps)}::jsonb, ${JSON.stringify(attempts)}::jsonb, ${score}, now())
      on conflict (user_id, lesson_id)
      do update set
        active_step = excluded.active_step,
        completed_steps = excluded.completed_steps,
        attempts = excluded.attempts,
        score = excluded.score,
        updated_at = now()
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not save progress."
      },
      { status: 500 }
    );
  }
}
