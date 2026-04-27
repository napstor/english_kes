import postgres from "postgres";

let client: postgres.Sql | null = null;
let schemaReady = false;

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.STORAGE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL or STORAGE_URL is not configured.");
  }

  if (!client) {
    client = postgres(databaseUrl, {
      prepare: false,
      ssl: "require"
    });
  }

  return client;
}

export async function ensureSchema() {
  if (schemaReady) return;

  const sql = getSql();

  await sql`
    create table if not exists app_users (
      id bigserial primary key,
      username text not null unique,
      password_hash text not null,
      role text not null check (role in ('admin', 'student')) default 'student',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists app_sessions (
      id text primary key,
      user_id bigint not null references app_users(id) on delete cascade,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists user_progress (
      user_id bigint not null references app_users(id) on delete cascade,
      lesson_id text not null,
      active_step integer not null default 0,
      completed_steps jsonb not null default '[]'::jsonb,
      attempts jsonb not null default '{}'::jsonb,
      score integer not null default 0,
      updated_at timestamptz not null default now(),
      primary key (user_id, lesson_id)
    )
  `;

  await sql`
    create table if not exists user_attempts (
      id bigserial primary key,
      user_id bigint not null references app_users(id) on delete cascade,
      lesson_id text not null,
      step_id text not null,
      kind text not null,
      prompt text not null,
      answer text,
      expected text,
      transcript text,
      score integer,
      feedback jsonb not null default '{}'::jsonb,
      audio_pathname text,
      created_at timestamptz not null default now()
    )
  `;

  schemaReady = true;
}
