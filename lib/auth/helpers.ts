import { LoginSchema } from "@/app/login/validation";
import {
  COOKIE_MAX_AGE,
  SESSION_TTL,
  shouldSecureCookies,
} from "@/constants/auth";
import {
  FlatRouteStep,
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_HTML_TOKEN_INPUT_NAME,
  MYED_SESSION_COOKIE_NAME,
  parseHTMLToken,
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";

import { MyEdCookieStore, PlainCookieStore } from "@/helpers/MyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/myed/sendMyEdRequest";
import * as cheerio from "cheerio";

import { fetchMyEd } from "@/instances/fetchMyEd";
import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import * as jose from "jose";
import { redirect } from "next/navigation";
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
  for (const entry of cookiesToAdd) {
    const name = entry[0];
    let value = entry[1];
    if (name === MYED_SESSION_COOKIE_NAME) {
      value = new jose.UnsecuredJWT({ session: value, studentID })
        .setIssuedAt()
        .setExpirationTime(SESSION_TTL)
        .encode();
    }
    cookieStore.set(name, value || "", {
      secure: shouldSecureCookies,
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
    });
  }
  if (formData) {
    cookieStore.set("username", username, {
      secure: shouldSecureCookies,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
    });
    cookieStore.set("password", password, {
      secure: shouldSecureCookies,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
    });
  }
}
const loginDefaultParams = {
  userEvent: "930",
  deploymentId: "aspen",
  mobile: "true",
};
export async function fetchAuthCookiesAndStudentID(
  username: string,
  password: string
) {
  const loginTokenResponse = await fetchMyEd("logon.do", {
    credentials: "include",
  });

  const loginTokenHTML = await loginTokenResponse.text();
  const $loginTokenDOM = cheerio.load(loginTokenHTML);
  const loginToken = parseHTMLToken($loginTokenDOM);
  if (!loginToken) throw new Error("Failed 2"); //!

  const cookiesPairs = loginTokenResponse.headers.getSetCookie();

  const cookiesToAdd = cookiesPairs
    .map((pair) => pair.split(";")[0].split("="))
    .filter(([name]) => MYED_AUTHENTICATION_COOKIES_NAMES.includes(name));
  const cookiesString = cookiesToAdd
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

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
  if (errorMessage) throw new Error(errorMessage);

  const studentsData = await fetchMyEd<
    OpenAPI200JSONResponse<"/users/students">
  >("rest/users/students", {
    headers: { Cookie: cookiesString },
  }).then((response) => response.json());

  const studentID = studentsData[0].studentOid;

  return {
    cookies: cookiesToAdd,
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
  const cookieStore = new MyEdCookieStore(externalStore);

  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (session) {
    await sendMyEdRequest({
      step: logoutStep,
      session,
      authCookies: getAuthCookies(cookieStore),
    }); //TODO: replace with after()
  }
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(name);
  }
  cookieStore.delete("username");
  cookieStore.delete("password");
}
export async function deleteSessionAndLogOut(cookieStore?: PlainCookieStore) {
  await deleteSession(cookieStore);
  redirect("/login");
}
