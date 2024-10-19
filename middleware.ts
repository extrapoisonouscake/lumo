import { NextRequest, NextResponse } from "next/server";
import { getFullCookieName } from "./helpers/getFullCookieName";

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get(
    getFullCookieName("JSESSIONID")
  )?.value;
  if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/login", request.url));
  }
  if (currentUser && request.nextUrl.pathname.startsWith("/login")) {
    return Response.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
