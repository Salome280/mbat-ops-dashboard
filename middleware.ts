import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessMode = process.env.NEXT_PUBLIC_ACCESS_MODE ?? "passcode";

  // If access is not enabled, do nothing
  if (accessMode !== "passcode") return NextResponse.next();

  const path = req.nextUrl.pathname;

  // Allow access page and api route
  if (path.startsWith("/access") || path.startsWith("/api/access")) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // Check cookie flag set after successful passcode entry
  const granted = req.cookies.get("mbat_access")?.value === "true";
  if (granted) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/access";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};