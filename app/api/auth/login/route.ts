import { NextResponse } from "next/server";
import { createSession, verifyLogin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const user = await verifyLogin(username, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Login failed."
      },
      { status: 500 }
    );
  }
}
