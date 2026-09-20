import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth-session";

export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get("auth")?.value);
  if (!session) {
    console.log("No valid session found, redirecting to login.");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/usuarios") && session.role !== 1) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/proprietarios/:path*", "/abates/:path*", "/agenda/:path*", "/usuarios/:path*"],
};
