import { NextRequest, NextResponse } from "next/server";
import { SESSION_TTL_IN_SECONDS } from "./constants/auth";
import { MYED_SESSION_COOKIE_NAME } from "./constants/myed";
import { getFullCookieName } from "./helpers/getFullCookieName";
import { isUserAuthenticated } from "./helpers/isUserAuthenticated";
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
const unauthenticatedPathnames = ["/login", "/register"];
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { cookies } = request;
  const isAuthenticated = isUserAuthenticated(cookies);
  const { pathname } = request.nextUrl;
  const isOnUnauthenticatedPage = unauthenticatedPathnames.some((path) =>
    pathname.startsWith(path)
  );
  if (isAuthenticated) {
    if (isOnUnauthenticatedPage) {
      return Response.redirect(new URL("/", request.url));
    } else {
      const cookieWritableStore = new MyEdCookieStore(response.cookies);
      const username = cookies.get(getFullCookieName("username"))?.value;
      const password = cookies.get(getFullCookieName("password"))?.value;

      if (
        !cookies.has(getFullCookieName(MYED_SESSION_COOKIE_NAME)) &&
        username &&
        password
      ) {
        const formData = {
          username,
          password,
        } as LoginSchema;

        try {
          loginSchema.parse(formData);

          const { cookies: cookiesToAdd } = await fetchAuthCookiesAndStudentID(
            formData.username,
            formData.password
          );
          for (const [name, value] of Object.entries(cookiesToAdd)) {
            cookieWritableStore.set(name, value || "", {
              maxAge: SESSION_TTL_IN_SECONDS,
            });
          }
        } catch (e: any) {
          const { message } = e;

          const safeErrorMessage: LoginErrors = isKnownLoginError(message)
            ? message
            : LoginErrors.unexpectedError;
          const redirectResponse = NextResponse.redirect(
            new URL(`/login?error=${safeErrorMessage}`, request.url)
          );
          await deleteSession(redirectResponse.cookies);

          return redirectResponse;
        }
      }
    }
  } else {
    // if (!isOnUnauthenticatedPage) {
    //   return NextResponse.redirect(new URL("/login", request.url));
    // }
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
