import { NextRequest, NextResponse } from "next/server";
import { SESSION_TTL_IN_SECONDS } from "./constants/auth";
import { MYED_SESSION_COOKIE_NAME } from "./constants/myed";
import {
  guestAllowedPathnames,
  unauthenticatedPathnames,
} from "./constants/website";
import { isGuestMode, isUserAuthenticated } from "./helpers/auth-statuses";
import { getFullCookieName } from "./helpers/getFullCookieName";
import { MyEdCookieStore } from "./helpers/MyEdCookieStore";
import {
  deleteSession,
  fetchAuthCookiesAndStudentID,
} from "./lib/auth/helpers";
import {
  isKnownLoginError,
  LoginErrors,
  loginSchema,
  LoginSchema,
} from "./lib/auth/public";
import { encryption } from "./lib/encryption";
async function getRedirectResponse(
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
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { cookies } = request;
  try{const isGuest = isGuestMode(cookies);
  const isAllowedGeneralAccess = isUserAuthenticated(cookies) || isGuest;
  const { pathname } = request.nextUrl;

  if (pathname === "/log-out") {
    const redirectResponse = await getRedirectResponse(request);
    return redirectResponse;
  }
  const isOnUnauthenticatedPage = unauthenticatedPathnames.some((path) =>
    pathname.startsWith(path)
  );
  if (isAllowedGeneralAccess) {
    if (isOnUnauthenticatedPage) {
      return Response.redirect(new URL("/", request.url));
    } else if (
      isGuest &&
      !guestAllowedPathnames.some((p) => pathname.startsWith(p))
    ) {
      return Response.redirect(new URL("/", request.url));
    } else {
      const cookieWritableStore = new MyEdCookieStore(response.cookies);
      const username = encryption.decrypt(
        cookies.get(getFullCookieName("username"))?.value || ""
      ); //? workaround
      const password = encryption.decrypt(
        cookies.get(getFullCookieName("password"))?.value || ""
      ); //? workaround
      if (
        !cookies.has(getFullCookieName(MYED_SESSION_COOKIE_NAME)) &&
        username &&
        password
      ) {
        const formData = {
          username,
          password: decodeURIComponent(password),
        } as LoginSchema;

        try {
          loginSchema.parse(formData);

          const { cookies: cookiesToAdd } = await fetchAuthCookiesAndStudentID(
            formData.username,
            formData.password
          );
          for (const [name, value] of Object.entries(cookiesToAdd)) {
            cookieWritableStore.set(name, value, {
              maxAge: SESSION_TTL_IN_SECONDS,
            });
          }
        } catch (e: any) {
          const redirectResponse = await getRedirectResponse(
            request,
            e.message
          );

          return redirectResponse;
        }
      }
    }
  } else {
    if (!isOnUnauthenticatedPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return response;}catch{const redirectResponse = await getRedirectResponse(
            request,
            "unknown-error"
          );

          return redirectResponse;}
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
