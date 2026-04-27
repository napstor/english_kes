import { NextResponse } from "next/server";
import { createUser, listUsers, requireAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not list users."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = (await request.json()) as {
      username?: string;
      password?: string;
      role?: "admin" | "student";
    };

    const username = body.username?.trim();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await createUser(username, password, body.role === "admin" ? "admin" : "student");
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not create user."
      },
      { status: 500 }
    );
  }
}
