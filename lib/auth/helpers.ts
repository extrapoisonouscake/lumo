import { SESSION_TTL_IN_SECONDS } from "@/constants/auth";
import {
  FlatRouteStep,
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_HTML_TOKEN_INPUT_NAME,
  MYED_SESSION_COOKIE_NAME,
  MyEdAuthenticationCookiesName,
  parseHTMLToken,
} from "@/constants/myed";
import { AuthCookies, getAuthCookies } from "@/helpers/getAuthCookies";
import { LoginErrors, LoginSchema } from "./public";

import { MyEdCookieStore, PlainCookieStore } from "@/helpers/MyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/myed/sendMyEdRequest";
import * as cheerio from "cheerio";

import {
  USER_SETTINGS_COOKIE_PREFIX,
  USER_SETTINGS_KEYS,
} from "@/constants/core";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { fetchMyEd } from "@/instances/fetchMyEd";
import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import { cookies } from "next/headers";
import "server-only";
import { genericErrorMessageVariableRegex } from "./public";
export class LoginError extends Error {
  authCookies?: AuthCookies;
  constructor(message: string, authCookies?: AuthCookies) {
    super(message);
    this.name = "LoginError";
    this.authCookies = authCookies;
  }
}
export async function performLogin(
  formData: LoginSchema,
  store?: PlainCookieStore
) {
  const { username, password } = formData;
  const cookieStore = new MyEdCookieStore(store);

  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(name);
  }
  const { cookies: cookiesToAdd, studentID } =
    await fetchAuthCookiesAndStudentID(username, password);

  setUpLogin({
    cookies: cookiesToAdd,
    studentID,
    credentials: formData,
    store,
  });
}
export function setUpLogin({
  cookies: cookiesToAdd,
  studentID,
  credentials,
  store,
}: {
  cookies: AuthCookies;
  studentID: string;
  credentials?: LoginSchema;
  store?: PlainCookieStore;
}) {
  const cookieStore = new MyEdCookieStore(store);
  for (const [name, value] of Object.entries(cookiesToAdd)) {
    cookieStore.set(name, value, {
      maxAge: SESSION_TTL_IN_SECONDS,
    });
  }
  cookieStore.set("studentId", studentID);
  if (credentials) {
    cookieStore.set("username", credentials.username);
    cookieStore.set("password", encodeURIComponent(credentials.password));
  }
}
const loginDefaultParams = {
  userEvent: "930",
  deploymentId: "aspen",
};
export async function parseHTMLTokenFromResponse(response: Response) {
  const loginTokenHTML = await response.text();
  const $loginTokenDOM = cheerio.load(loginTokenHTML);
  const loginToken = parseHTMLToken($loginTokenDOM);
  return loginToken;
}
export async function getFreshAuthCookiesAndHTMLToken() {
  const loginTokenResponse = await fetchMyEd("logon.do", {
    credentials: "include",
  });
  const loginToken = await parseHTMLTokenFromResponse(loginTokenResponse);
  if (!loginToken) throw new Error("Failed 2"); //!

  const cookiesPairs = loginTokenResponse.headers.getSetCookie();

  const cookiesToAdd = Object.fromEntries(
    cookiesPairs
      .map((pair) => pair.split(";")[0].split("="))
      .filter(([name]) =>
        MYED_AUTHENTICATION_COOKIES_NAMES.includes(
          name as MyEdAuthenticationCookiesName
        )
      )
  );
  return {
    cookies: cookiesToAdd as AuthCookies,
    token: loginToken,
  };
}
export async function fetchAuthCookiesAndStudentID(
  username: string,
  password: string
) {
  const { cookies, token: loginToken } =
    await getFreshAuthCookiesAndHTMLToken();

  const cookiesString = convertObjectToCookieString(cookies);

  const loginParams = new URLSearchParams({
    ...loginDefaultParams,
    [MYED_HTML_TOKEN_INPUT_NAME]: loginToken,
    username,
    password,
  });

  const loginResponse = await fetchMyEd("logon.do", {
    method: "POST",
    body: loginParams,

    headers: {
      Cookie: cookiesString,
    },
  });
  const loginHtml = await loginResponse.text();
  const $ = cheerio.load(loginHtml);

  const rawErrorMessage = parseAuthGenericErrorMessage($);
  if (rawErrorMessage) {
    const errorMessage =
      rawLoginErrorMessageToIDMap[rawErrorMessage] ?? rawErrorMessage;
    throw new LoginError(errorMessage);
  }
  if (needsPasswordChange($)) {
    throw new LoginError(LoginErrors.passwordChangeRequired, cookies);
  }
  const studentID = await fetchStudentID(cookies);

  return {
    cookies,
    studentID,
  };
}
export async function fetchStudentID(cookies: AuthCookies) {
  const studentsData = await fetchMyEd<
    OpenAPI200JSONResponse<"/users/students">
  >("rest/users/students", {
    headers: { Cookie: convertObjectToCookieString(cookies) },
  }).then((response) => response.json());

  const studentID = studentsData[0].studentOid;
  return studentID;
}
export const rawLoginErrorMessageToIDMap: Record<string, LoginErrors> = {
  "This account has been disabled.": LoginErrors.accountDisabled,
  "Invalid login.": LoginErrors.invalidAuth,
};
export function parseAuthGenericErrorMessage($: cheerio.CheerioAPI) {
  let errorMessage: string | null = null;
  $('script[language="JavaScript"]').each(function () {
    const scriptContent = $(this).html();
    if (!scriptContent) return;

    const match = scriptContent.match(genericErrorMessageVariableRegex);
    if (match) {
      errorMessage = match[2];
      return false;
    }
  });
  return errorMessage;
}
// function parseLoginErrorMessage($: cheerio.CheerioAPI) {
//   const rawErrorMessage = $('.panel div[style="color:red"]')
//     .text()
//     .trim()
//     .replace(/\n/g, " ");
//   return rawErrorMessage
//     ? rawErrorMessageToIDMap[rawErrorMessage] ?? LoginError.unexpectedError
//     : undefined;
// }
function needsPasswordChange($: cheerio.CheerioAPI) {
  let wasFound = false;
  $('script[language="JavaScript"], script[language="Javascript"]').each(
    function () {
      const scriptContent = $(this).html();
      if (!scriptContent) return;
      if (scriptContent.includes("changePassword.do?parentForm=logonForm")) {
        wasFound = true;
        return false;
      }
    }
  );
  return wasFound;
}
const logoutStep: FlatRouteStep = {
  method: "GET",
  path: "logout.do",
  expect: "html",
};
export async function deleteSession(externalStore?: PlainCookieStore) {
  const cookiePlainStore = externalStore ?? cookies();
  const cookieStore = new MyEdCookieStore(cookiePlainStore);

  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (session) {
    try {
      await sendMyEdRequest({
        step: logoutStep,
        session,
        authCookies: getAuthCookies(cookieStore),
      }); //TODO: replace with after()
    } catch {}
  }
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(name);
  }
  cookieStore.delete("studentId");
  cookieStore.delete("username");
  cookieStore.delete("password");
  for (const setting of USER_SETTINGS_KEYS) {
    cookiePlainStore.delete(`${USER_SETTINGS_COOKIE_PREFIX}.${setting}`);
  }
}
