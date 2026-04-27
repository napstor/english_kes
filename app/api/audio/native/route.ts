import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("pathname");

  if (!pathname) {
    return NextResponse.json({ error: "pathname is required." }, { status: 400 });
  }

  const blob = await get(pathname, { access: "private" });

  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Audio not found." }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType || "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
