import {
  AUTH_COOKIES_NAMES,
  IS_LOGGED_IN_COOKIE_NAME,
  SESSION_TTL_IN_SECONDS,
} from "@/constants/auth";
import {
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MyEdAuthenticationCookiesName,
  parseHTMLToken,
} from "@/constants/myed";
import { db } from "@/db";
import {
  AuthCookies,
  CookieMyEdUser,
  getAuthCookies,
} from "@/helpers/getAuthCookies";
import { LoginErrors, LoginSchema } from "./public";

import {
  cookieDefaultOptions,
  MyEdCookieStore,
  PlainCookieStore,
} from "@/helpers/MyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/myed/sendMyEdRequest";
import * as cheerio from "cheerio";

import {
  USER_SETTINGS_DEFAULT_VALUES,
  Widgets,
  WidgetsConfiguration,
} from "@/constants/core";
import { KNOWN_SCHOOL_MYED_NAME_TO_ID } from "@/constants/schools";
import { tracked_school_data, user_settings, users } from "@/db/schema";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { hashString } from "@/helpers/hashString";
import { DEVICE_ID_COOKIE_NAME } from "@/helpers/notifications";
import { fetchMyEd, MyEdBaseURLs } from "@/instances/fetchMyEd";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { FlatRouteStep } from "@/parsing/myed/routes";
import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import { UserRole } from "@/types/school";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { after } from "next/server";
import "server-only";
import { runNotificationUnsubscriptionDBCalls } from "../../core/settings/helpers";
export class LoginError extends Error {
  authCookies?: AuthCookies;
  constructor(message: string, authCookies?: AuthCookies) {
    super(message);
    this.name = "LoginError";
    this.authCookies = authCookies;
  }
}

const initFirstLogin = async ({
  myedUser,
  targetId,
  requestMyEd,
}: {
  requestMyEd: ReturnType<typeof getMyEd>;
  myedUser: CookieMyEdUser;
  targetId: string | undefined;
}) => {
  const userId = hashString(myedUser.id);
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (existingUser) return;

  await db.insert(users).values({ id: userId });
  const widgetsConfiguration: WidgetsConfiguration = [
    ...USER_SETTINGS_DEFAULT_VALUES.widgetsConfiguration,
  ];
  let knownSchool: string | undefined;
  if (targetId) {
    const personalInfo = await requestMyEd("studentDetails");
    knownSchool = KNOWN_SCHOOL_MYED_NAME_TO_ID[personalInfo.schoolName];

    if (knownSchool) {
      widgetsConfiguration.push({
        id: "announcements-1",
        type: Widgets.ANNOUNCEMENTS,
        width: 1,
        height: 1,
      });
    }
  }
  await Promise.all([
    db.insert(user_settings).values({
      ...USER_SETTINGS_DEFAULT_VALUES,
      widgetsConfiguration: widgetsConfiguration,
      userId,
      schoolId: knownSchool,
    }),
    db.insert(tracked_school_data).values({
      userId,
    }),
  ]);
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
  const tokens = await fetchAuthCookies(username, password);
  const user = await fetchCurrentUser(tokens);
  let targetId: string | undefined;
  if ([UserRole.Parent, UserRole.Student].includes(user.role)) {
    targetId = await fetchFirstStudentId(tokens);
  }
  await setUpLogin({
    tokens,
    myedUser: user,
    credentials: formData,
    targetId,
    store,
  });
}
export async function setUpSessionTokens({
  tokens,
  store: externalStore,
}: {
  tokens: AuthCookies;
  store: PlainCookieStore;
}) {
  const store = await MyEdCookieStore.create(externalStore);
  store.set(
    AUTH_COOKIES_NAMES.tokens,
    convertObjectToCookieString(tokens, false),
    {
      maxAge: SESSION_TTL_IN_SECONDS,
    }
  );
  store.set(
    AUTH_COOKIES_NAMES.tokensExpireAt,
    dayjs().add(SESSION_TTL_IN_SECONDS, "second").toISOString()
  );
}
export async function setUpLogin({
  tokens,
  myedUser,
  credentials,
  store: externalStore,
  targetId,
}: {
  tokens: AuthCookies;
  myedUser: CookieMyEdUser;
  credentials?: LoginSchema;
  store?: PlainCookieStore;
  targetId: string | undefined;
}) {
  const store = externalStore ?? (await cookies());
  const cookieStore = await MyEdCookieStore.create(store);

  await setUpSessionTokens({ tokens, store });

  cookieStore.set(AUTH_COOKIES_NAMES.user, JSON.stringify(myedUser));
  if (targetId) {
    cookieStore.set(AUTH_COOKIES_NAMES.targetId, targetId);
  }
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
  const requestMyEd = getMyEd({
    authCookies: tokens,
    myedUser,
    targetId,
  });
  await requestMyEd("normalizeInternalLanguage");
  await initFirstLogin({ requestMyEd, myedUser, targetId });
}

export async function parseHTMLTokenFromResponse(response: Response) {
  const loginTokenHTML = await response.text();
  const $loginTokenDOM = cheerio.load(loginTokenHTML);
  const loginToken = parseHTMLToken($loginTokenDOM);
  return loginToken;
}
export function parseCookiesFromSetCookieHeader(
  pairs: string[],
  filter?: (name: string) => boolean
) {
  let entries = pairs.map((pair) => (pair.split(";")[0] as string).split("="));
  if (filter) {
    entries = entries.filter(([name]) => filter(name!));
  }
  return Object.fromEntries(entries) as Record<string, string>;
}
export async function getFreshAuthCookies() {
  const loginTokenResponse = await fetchMyEd(
    "/aspen-login/",
    {
      credentials: "include",
    },
    MyEdBaseURLs.CUSTOM
  );

  const cookiesPairs = loginTokenResponse.headers.getSetCookie();

  const cookiesToAdd = parseCookiesFromSetCookieHeader(cookiesPairs, (name) =>
    MYED_AUTHENTICATION_COOKIES_NAMES.includes(
      name as MyEdAuthenticationCookiesName
    )
  );
  return cookiesToAdd as AuthCookies;
}
const rawLoginErrorMessageToIDMap: Record<string, LoginErrors> = {
  "This account has been disabled.": LoginErrors.accountDisabled,
  "Invalid login.": LoginErrors.invalidAuth,
};

export async function fetchAuthCookies(username: string, password: string) {
  const loginParams = new URLSearchParams({
    username,
    password,
  });
  let cookies: AuthCookies;
  try {
    const response = await fetchMyEd<{
      aspenUrl: string;
      csrfToken: string;
      aaspLogon: boolean;
      aaspOrganizationOid: string | null;
      pwdRecoveryMode: string;
      mfaMode: string;
      mfaOption: string | null;
      defaultPortal: string;
      defaultView: string;
      securityAnswerExist: boolean;
      passwordExpired: boolean;
    }>(
      "/auth",
      {
        method: "POST",
        body: loginParams.toString(),

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      MyEdBaseURLs.NEW
    );
    const data = await response.json();
    cookies = parseCookiesFromSetCookieHeader(
      response.headers.getSetCookie()!,
      (name) =>
        MYED_AUTHENTICATION_COOKIES_NAMES.includes(
          name as MyEdAuthenticationCookiesName
        )
    ) as AuthCookies;
    //activating the cookies
    await fetch(data.aspenUrl, {
      headers: {
        Cookie: convertObjectToCookieString(cookies),
      },
    });
  } catch (e) {
    const response = (await (e as Response).json()) as {
      code: number;
      message: string;
    }; //TODO: CLEAN THIS UP

    const errorMessage =
      rawLoginErrorMessageToIDMap[response.message] ?? response.message;
    throw new LoginError(errorMessage);
  }
  return cookies;
}

export const MYED_USER_TYPE_TO_ROLE_MAP: Record<
  OpenAPI200JSONResponse<"/aspen/rest/users/currentUser">["userType"],
  UserRole
> = {
  STUDENT: UserRole.Student,
  STAFF: UserRole.Teacher,
  FAMILY: UserRole.Parent,
};

export async function fetchCurrentUser(cookies: AuthCookies) {
  const userData = await fetchMyEd<
    OpenAPI200JSONResponse<"/aspen/rest/users/currentUser">
  >("/rest/users/currentUser", {
    headers: { Cookie: convertObjectToCookieString(cookies) },
  }).then((response) => response.json());
  return {
    id: userData.personOid,
    role: MYED_USER_TYPE_TO_ROLE_MAP[userData.userType],
  };
}
export async function fetchFirstStudentId(cookies: AuthCookies) {
  const studentsData = await fetchMyEd<
    OpenAPI200JSONResponse<"/app/rest/students">
  >(
    "/students",
    {
      headers: { Cookie: convertObjectToCookieString(cookies) },
    },
    MyEdBaseURLs.NEW
  ).then((response) => response.json());

  const studentId = studentsData[0]!.studentOid;
  if (!studentId) throw new LoginError(LoginErrors.unexpectedError);
  return studentId;
}

const logoutStep: FlatRouteStep = {
  method: "GET",
  path: "/logout.do",
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
    const myedUserString = cookieStore.get(AUTH_COOKIES_NAMES.user)?.value;
    const myedUser = myedUserString ? JSON.parse(myedUserString) : undefined;
    if (deviceId && myedUser) {
      const userId = hashString(myedUser.id);
      after(() => runNotificationUnsubscriptionDBCalls(userId, deviceId));
      cookiePlainStore.delete(DEVICE_ID_COOKIE_NAME);
    }
    cookieStore.delete(AUTH_COOKIES_NAMES.tokens);
  }
  cookieStore.delete(AUTH_COOKIES_NAMES.credentials);
  cookieStore.delete(AUTH_COOKIES_NAMES.user);
  cookieStore.delete(AUTH_COOKIES_NAMES.targetId);
  cookiePlainStore.delete(IS_LOGGED_IN_COOKIE_NAME);
}
