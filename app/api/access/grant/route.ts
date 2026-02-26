import { NextResponse } from "next/server";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true });
  res.cookies.set("mbat_access", "true", {
    httpOnly: false,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return res;
}
