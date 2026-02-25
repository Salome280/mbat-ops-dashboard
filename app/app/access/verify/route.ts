import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string };
    const code = (body.code ?? "").trim();

    const expected = process.env.ACCESS_PASSCODE ?? "";
    const ok = expected.length > 0 && code === expected;

    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}