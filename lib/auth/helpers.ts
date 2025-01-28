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
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { getFullMyEdUrl } from "@/helpers/getFullMyEdURL";

import { MyEdCookieStore, PlainCookieStore } from "@/helpers/MyEdCookieStore";
import { myEdRestAPIClient } from "@/instances/myed-rest-fetch";
import { sendMyEdRequest } from "@/parsing/myed/sendMyEdRequest";
import * as cheerio from "cheerio";
import * as cookie from "cookie";
import * as jose from "jose";
import { redirect } from "next/navigation";
import "server-only";
import { LoginError } from "./public";
const loginDefaultParams = {
  userEvent: "930",
  deploymentId: "aspen",
  scrollX: "0",
  scrollY: "0",
  mobile: "false",
  formFocusField: "username",
  districtId: "Ent",
  idpName: "BCSC Production SSO",
};

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
export async function fetchAuthCookiesAndStudentID(
  username: string,
  password: string
) {
  const loginTokenResponse = await fetch(getFullMyEdUrl("logon.do?mobile=1"), {
    credentials: "include",
  });
  if (!loginTokenResponse.ok) {
    throw new Error("Failed"); //!
  }

  const loginTokenHTML = await loginTokenResponse.text();
  const $loginTokenDOM = cheerio.load(loginTokenHTML);
  const loginToken = $loginTokenDOM(`[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`)
    .first()
    .val();
  if (!loginToken) throw new Error("Failed"); //!
  const loginFormData = new FormData();
  const loginParams = {
    [MYED_HTML_TOKEN_INPUT_NAME]: Array.isArray(loginToken)
      ? loginToken[0]
      : loginToken,
    username,
    password,
    ...loginDefaultParams,
  };
  for (const [key, value] of Object.entries(loginParams)) {
    loginFormData.append(key, value);
  }

  const cookiesPairs = loginTokenResponse.headers.getSetCookie();
  if (!cookiesPairs) throw new Error("Failed"); //!
  const rawCookiesString = cookiesPairs.join("; ");
  const loginResponse = await fetch(getFullMyEdUrl("logon.do?mobile=1"), {
    method: "POST",
    body: loginFormData,
    headers: {
      Cookie: rawCookiesString,
    },
  });
  if (!loginResponse.ok) {
    throw new Error("Failed"); //!
  }
  const loginHtml = await loginResponse.text();
  const errorMessage = parseLoginErrorMessage(loginHtml);
  if (errorMessage) throw new Error(errorMessage);
  const cookiesToAdd = cookiesPairs.filter(([name]) =>
    MYED_AUTHENTICATION_COOKIES_NAMES.includes(name)
  );
  const cookiesString = cookiesToAdd
    .map(([name, value]) => cookie.serialize(name, value || ""))
    .join("; ");
  const studentsRequest = await myEdRestAPIClient.GET("/users/students", {
    headers: { Cookie: cookiesString },
  });
  if (studentsRequest.error) throw new Error("Error");
  const studentID = studentsRequest.data[0].studentOid;

  return {
    cookies: cookiesToAdd.filter(([name]) =>
      MYED_AUTHENTICATION_COOKIES_NAMES.includes(name)
    ),
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
    });
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
