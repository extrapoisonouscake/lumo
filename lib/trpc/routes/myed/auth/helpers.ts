import {
  AUTH_COOKIES_NAMES,
  IS_LOGGED_IN_COOKIE_NAME,
  SESSION_TTL_IN_SECONDS,
} from "@/constants/auth";
import {
  FlatRouteStep,
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_HTML_TOKEN_INPUT_NAME,
  MyEdAuthenticationCookiesName,
  parseHTMLToken,
} from "@/constants/myed";
import { db } from "@/db";
import { AuthCookies, getAuthCookies } from "@/helpers/getAuthCookies";
import { LoginErrors, LoginSchema } from "./public";

import {
  cookieDefaultOptions,
  MyEdCookieStore,
  PlainCookieStore,
} from "@/helpers/MyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/myed/sendMyEdRequest";
import * as cheerio from "cheerio";

import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { user_settings, users } from "@/db/schema";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { hashString } from "@/helpers/hashString";
import { DEVICE_ID_COOKIE_NAME } from "@/helpers/notifications";
import { fetchMyEd } from "@/instances/fetchMyEd";
import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { after } from "next/server";
import "server-only";
import { runNotificationUnsubscriptionDBCalls } from "../../core/settings/helpers";
import { genericErrorMessageVariableRegex } from "./public";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { KNOWN_SCHOOL_MYED_NAME_TO_ID, } from "@/constants/schools";
export class LoginError extends Error {
  authCookies?: AuthCookies;
  constructor(message: string, authCookies?: AuthCookies) {
    super(message);
    this.name = "LoginError";
    this.authCookies = authCookies;
  }
}

const initStudentFirstLogin = async ({tokens,studentId}:{tokens:AuthCookies,studentId: string}) => {
  
  const hashedStudentId = hashString(studentId);
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, hashedStudentId),
  });
  if (existingUser) return;
  const personalInfo=await getMyEd({authCookies:tokens,studentId})('personalDetails')
  const knownSchool=KNOWN_SCHOOL_MYED_NAME_TO_ID[personalInfo.schoolName]
  await db.insert(users).values({ id: hashedStudentId });

  // const encryptedCredentials = credentials
  // ? {
  //     username: encryption.encrypt(credentials.username),
  //     password: encryption.encrypt(credentials.password),
  //   }
  // : undefined;
  await db.insert(user_settings).values({
    ...USER_SETTINGS_DEFAULT_VALUES,
    userId: hashedStudentId,
    schoolId:knownSchool
  });
};
export async function performLogin(
  formData: LoginSchema,
  store?: PlainCookieStore
) {
  const { username, password } = formData;
  const cookieStore = await MyEdCookieStore.create(store);

  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(name);
  }
  const { studentId, tokens } = await fetchAuthCookiesAndStudentId(
    username,
    password
  );

  await setUpLogin({
    tokens,
    studentId,
    credentials: formData,
    store,
  });
}

export async function setUpLogin({
  tokens,
  studentId,
  credentials,
  store: externalStore,
}: {
  tokens: AuthCookies;
  studentId: string;
  credentials?: LoginSchema;
  store?: PlainCookieStore;
}) {
  const store = externalStore ?? (await cookies());
  const cookieStore = await MyEdCookieStore.create(store);
  const tokensString = convertObjectToCookieString(tokens, false);
  cookieStore.set(AUTH_COOKIES_NAMES.tokens, tokensString, {
    maxAge: SESSION_TTL_IN_SECONDS,
  });

  cookieStore.set(AUTH_COOKIES_NAMES.studentId, studentId);
  if (credentials) {
    const credentialsString =
      encodeURIComponent(credentials.username) +
      "|" +
      encodeURIComponent(credentials.password);
    cookieStore.set(AUTH_COOKIES_NAMES.credentials, credentialsString);
  }
  store.set(IS_LOGGED_IN_COOKIE_NAME, "true", {
    ...cookieDefaultOptions,
    httpOnly: false,
  });
  await initStudentFirstLogin({tokens,studentId});
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
      .map((pair) => (pair.split(";")[0] as string).split("="))
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
export async function fetchAuthCookiesAndStudentId(
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
  const studentId = await fetchStudentId(cookies);
  return {
    tokens: cookies,
    studentId,
  };
}
export async function fetchStudentId(cookies: AuthCookies) {
  const studentsData = await fetchMyEd<
    OpenAPI200JSONResponse<"/users/students">
  >("rest/users/students", {
    headers: { Cookie: convertObjectToCookieString(cookies) },
  }).then((response) => response.json());

  const studentId = studentsData[0]?.studentOid;
  if (!studentId) throw new LoginError(LoginErrors.invalidAuth);
  return studentId;
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
      errorMessage = match[2] ?? null;
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
  const cookiePlainStore = externalStore ?? (await cookies());
  const cookieStore = await MyEdCookieStore.create(cookiePlainStore);

  const session = cookieStore.get(AUTH_COOKIES_NAMES.tokens)?.value;
  if (session) {
    const authCookies = getAuthCookies(cookieStore);
    after(() =>
      sendMyEdRequest({
        step: logoutStep,
        authCookies,
      })
    );
    const deviceId = cookiePlainStore.get(DEVICE_ID_COOKIE_NAME)?.value;
    const studentId = cookieStore.get(AUTH_COOKIES_NAMES.studentId)?.value;
    if (deviceId && studentId) {
      const studentHashedId = hashString(studentId);
      after(() =>
        runNotificationUnsubscriptionDBCalls(studentHashedId, deviceId)
      );
      cookiePlainStore.delete(DEVICE_ID_COOKIE_NAME);
    }
    cookieStore.delete(AUTH_COOKIES_NAMES.tokens);
  }
  cookieStore.delete(AUTH_COOKIES_NAMES.credentials);
  cookieStore.delete(AUTH_COOKIES_NAMES.studentId);
  cookiePlainStore.delete(IS_LOGGED_IN_COOKIE_NAME);
}
