// create a proxy for auth user and protected routes
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/studio/:path*",
    "/courses/:path*",
    "/learn/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/logout/:path*",
  ],
};
