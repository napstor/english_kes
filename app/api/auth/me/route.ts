import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not load user."
      },
      { status: 500 }
    );
  }
}
