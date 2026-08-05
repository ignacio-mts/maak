import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionOptions, type SiteSession } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/health"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SiteSession>(
    request,
    response,
    getSessionOptions(),
  );

  if (!session.isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
