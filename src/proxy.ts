import { NextRequest, NextResponse } from "next/server";

/**
 * Cookie-based auth guard for protected routes.
 */
export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Don't guard auth pages themselves.
  if (pathname === "/login" || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  const access = request.cookies.get("lms_access_token")?.value;
  console.log("access", access);
  const refresh = request.cookies.get("lms_refresh_token")?.value;
  const authed = Boolean(access || refresh);

  if (!authed) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("next", `${pathname}${nextUrl.search || ""}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/studio/:path*",
    "/learn/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/logout/:path*",
  ],
};
