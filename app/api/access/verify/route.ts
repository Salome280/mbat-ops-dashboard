import { NextResponse } from "next/server";

const expected = process.env.ACCESS_PASSCODE ?? "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const ok = expected !== "" && code === expected;
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
