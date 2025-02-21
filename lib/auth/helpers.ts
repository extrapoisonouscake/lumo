import { SESSION_TTL_IN_SECONDS } from "@/constants/auth";
import {
  FlatRouteStep,
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_HTML_TOKEN_INPUT_NAME,
  MYED_SESSION_COOKIE_NAME,
  MyEdAuthenticationCookiesName,
  parseHTMLToken,
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { LoginSchema } from "./public";

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
import { LoginError } from "./public";

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
  for (const [name, value] of Object.entries(cookiesToAdd)) {
    cookieStore.set(name, value, {
      maxAge: SESSION_TTL_IN_SECONDS,
    });
  }
  cookieStore.set("studentId", studentID);
  if (formData) {
    cookieStore.set("username", username);
    cookieStore.set("password", password);
  }
}
const loginDefaultParams = {
  userEvent: "930",
  deploymentId: "aspen",
  mobile: "true",
};
export async function getFreshAuthCookiesAndHTMLToken() {
  const loginTokenResponse = await fetchMyEd("logon.do", {
    credentials: "include",
  });

  const loginTokenHTML = await loginTokenResponse.text();
  const $loginTokenDOM = cheerio.load(loginTokenHTML);
  const loginToken = parseHTMLToken($loginTokenDOM);
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
    cookies: cookiesToAdd as Record<string, string>,
    token: loginToken,
  };
}
export async function fetchAuthCookiesAndStudentID(
  username: string,
  password: string
) {
  const { cookies, token: loginToken } =
    await getFreshAuthCookiesAndHTMLToken();
  console.log("cookies", cookies, loginToken);
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
  const errorMessage = parseLoginErrorMessage(loginHtml);
  console.log("errorMessage", errorMessage);
  if (errorMessage) throw new Error(errorMessage);

  const studentsData = await fetchMyEd<
    OpenAPI200JSONResponse<"/users/students">
  >("rest/users/students", {
    headers: { Cookie: cookiesString },
  }).then((response) => response.json());

  const studentID = studentsData[0].studentOid;

  return {
    cookies,
    studentID,
  };
}
const rawErrorMessageToIDMap: Record<string, LoginError> = {
  "This account has been disabled.": "account-disabled",
  "Invalid login.": "invalid-auth",
};
function parseLoginErrorMessage(html: string) {
  const $ = cheerio.load(html);
  const rawErrorMessage = $('.panel div[style="color:red"]')
    .text()
    .trim()
    .replace(/\n/g, " ");
  return rawErrorMessage
    ? rawErrorMessageToIDMap[rawErrorMessage] ?? "unexpected-error"
    : undefined;
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
