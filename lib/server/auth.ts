import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { ensureSchema, getSql } from "@/lib/server/db";

export type AppUser = {
  id: number;
  username: string;
  role: "admin" | "student";
};

const sessionCookie = "english_kes_session";
const sessionTtlDays = 30;

export async function bootstrapAdmin() {
  await ensureSchema();

  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) return;

  const sql = getSql();
  const existing = await sql<AppUser[]>`
    select id, username, role
    from app_users
    where username = ${username}
    limit 1
  `;

  if (existing.length) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await sql`
    insert into app_users (username, password_hash, role)
    values (${username}, ${passwordHash}, 'admin')
  `;
}

export async function verifyLogin(username: string, password: string) {
  await bootstrapAdmin();

  const sql = getSql();
  const users = await sql<Array<AppUser & { password_hash: string }>>`
    select id, username, password_hash, role
    from app_users
    where username = ${username}
    limit 1
  `;

  const user = users[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return {
    id: Number(user.id),
    username: user.username,
    role: user.role
  } satisfies AppUser;
}

export async function createSession(userId: number) {
  await ensureSchema();

  const sql = getSql();
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionTtlDays * 24 * 60 * 60 * 1000);

  await sql`
    insert into app_sessions (id, user_id, expires_at)
    values (${sessionId}, ${userId}, ${expiresAt})
  `;

  cookies().set(sessionCookie, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function destroySession() {
  const sessionId = cookies().get(sessionCookie)?.value;
  cookies().delete(sessionCookie);

  if (!sessionId) return;

  await ensureSchema();
  const sql = getSql();
  await sql`delete from app_sessions where id = ${sessionId}`;
}

export async function getCurrentUser() {
  const sessionId = cookies().get(sessionCookie)?.value;
  if (!sessionId) return null;

  await bootstrapAdmin();
  const sql = getSql();

  const users = await sql<AppUser[]>`
    select app_users.id, app_users.username, app_users.role
    from app_sessions
    join app_users on app_users.id = app_sessions.user_id
    where app_sessions.id = ${sessionId}
      and app_sessions.expires_at > now()
    limit 1
  `;

  const user = users[0];
  if (!user) return null;

  return {
    id: Number(user.id),
    username: user.username,
    role: user.role
  } satisfies AppUser;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

export async function createUser(username: string, password: string, role: AppUser["role"] = "student") {
  await ensureSchema();

  const sql = getSql();
  const passwordHash = await bcrypt.hash(password, 12);
  const users = await sql<AppUser[]>`
    insert into app_users (username, password_hash, role)
    values (${username}, ${passwordHash}, ${role})
    returning id, username, role
  `;

  const user = users[0];
  return {
    id: Number(user.id),
    username: user.username,
    role: user.role
  } satisfies AppUser;
}

export async function listUsers() {
  await ensureSchema();
  const sql = getSql();

  const users = await sql<AppUser[]>`
    select id, username, role
    from app_users
    order by created_at desc
  `;

  return users.map((user) => ({
    id: Number(user.id),
    username: user.username,
    role: user.role
  })) satisfies AppUser[];
}
