import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PREFIXES = ["/login", "/register", "/api/auth", "/api/webhooks"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // "/" is the public marketing homepage — matched exactly, since a prefix
  // match on "/" would otherwise make every route public.
  const isPublic = pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  if (!req.auth) {
    // API routes get a clean 401 from requireTenant() instead of an HTML
    // redirect — a JSON client following a redirect to /login would otherwise
    // get an HTML body where it expects JSON.
    if (pathname.startsWith("/api/")) return NextResponse.next();

    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
