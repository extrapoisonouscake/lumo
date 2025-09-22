import { NextRequest, NextResponse } from "next/server";
import { publicPathnames, unauthenticatedPathnames } from "./constants/website";
import { serverAuthChecks } from "./helpers/server-auth-checks";
import { deleteSession } from "./lib/trpc/routes/myed/auth/helpers";
import {
  isKnownLoginError,
  LoginErrors,
} from "./lib/trpc/routes/myed/auth/public";

async function getLoginRedirectResponse(
  request: NextRequest,
  errorMessage?: string
) {
  let safeErrorMessage;
  if (errorMessage) {
    safeErrorMessage = isKnownLoginError(errorMessage)
      ? errorMessage
      : LoginErrors.unexpectedError;
  }
  const redirectResponse = NextResponse.redirect(
    new URL(
      `/login${errorMessage ? `?error=${safeErrorMessage}` : ""}`,
      request.url
    )
  );
  await deleteSession(redirectResponse.cookies);

  return redirectResponse;
}
export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { cookies } = request;

  const isAllowedGeneralAccess = serverAuthChecks.isLoggedIn(cookies);
  const { pathname } = request.nextUrl;

  if (pathname === "/log-out") {
    const redirectResponse = await getLoginRedirectResponse(request);
    return redirectResponse;
  }
  const isOnUnauthenticatedPage = unauthenticatedPathnames.some((path) =>
    pathname.startsWith(path)
  );
  const isOnPublicPage = publicPathnames.includes(pathname);
  if (isOnPublicPage) {
    return response;
  }
  if (isAllowedGeneralAccess) {
    if (isOnUnauthenticatedPage) {
      return Response.redirect(new URL("/", request.url));
    }
  } else {
    if (!isOnUnauthenticatedPage && !publicPathnames.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|manifest.json|favicons).*)",
  ],
};
