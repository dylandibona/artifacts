import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_USERNAME = "dylandibona";
const ADMIN_PASSWORD = "calliope05";

export function middleware(request: NextRequest) {
  // Only protect /admin routes (but not the login page)
  if (request.nextUrl.pathname.startsWith("/admin") &&
      !request.nextUrl.pathname.startsWith("/admin/login")) {

    const authCookie = request.cookies.get("admin_auth");

    if (!authCookie || authCookie.value !== `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`) {
      // Redirect to login page
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
