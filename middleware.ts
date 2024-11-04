import { NextRequest, NextResponse } from "next/server";
import { isUserAuthenticated } from "./helpers/isUserAuthenticated";

export function middleware(request: NextRequest) {
  const { cookies: cookieStore } = request;
  const isAuthenticated = isUserAuthenticated(cookieStore);
  const isOnLoginPage = request.nextUrl.pathname.startsWith("/login");
  if (isAuthenticated) {
    if (isOnLoginPage) {
      return Response.redirect(new URL("/", request.url));
    }
  } else {
    if (!isOnLoginPage) {
      return Response.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
