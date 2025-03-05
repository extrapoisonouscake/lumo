"use server";

import { MYED_HTML_TOKEN_INPUT_NAME } from "@/constants/myed";
import { isUserAuthenticated } from "@/helpers/auth-statuses";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { AuthCookies, getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { fetchMyEd } from "@/instances/fetchMyEd";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { actionClient } from "../safe-action";
import {
  deleteSession,
  fetchStudentID,
  getFreshAuthCookiesAndHTMLToken,
  LoginError,
  parseAuthGenericErrorMessage,
  parseHTMLTokenFromResponse,
  performLogin,
  rawLoginErrorMessageToIDMap,
  setUpLogin,
} from "./helpers";
import {
  authCookiesSchema,
  changePasswordSchema,
  genericErrorMessageVariableRegex,
  isKnownLoginError,
  LoginErrors,
  loginSchema,
  passwordResetSchema,
  registerSchema,
  RegistrationInternalFields,
  RegistrationType,
} from "./public";
export const enterGuestMode = actionClient.action(async () => {
  cookies().set("isGuest", "true");
  redirect("/");
});
export const exitGuestMode = actionClient.action(async () => {
  cookies().delete("isGuest");
  redirect("/login");
});
export const login = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    try {
      await performLogin(parsedInput);
    } catch (e: any) {
      const safeErrorMessage: LoginErrors = isKnownLoginError(e.message)
        ? e.message
        : LoginErrors.unexpectedError;
      return {
        success: false,
        message: safeErrorMessage,
        authCookies: e.authCookies,
      };
    }
    redirect("/");
  });
export const forceLogin = actionClient
  .schema(
    z.object({ authCookies: authCookiesSchema, credentials: loginSchema })
  )
  .action(async ({ parsedInput }) => {
    const { authCookies, credentials } = parsedInput;
    const studentID = await fetchStudentID(authCookies);
    setUpLogin({
      cookies: authCookies,
      credentials,
      studentID,
    });
  });
export const logOut = actionClient.action(async () => {
  await deleteSession();
  redirect("/login");
});
const convertObjectToWeirdStringRepresentation = (
  obj: Record<string, string>
) => {
  return Object.entries(obj)
    .map(([key, value]) => `{${key},${value}}`)
    .join(",");
};
const registrationFieldsByType: Record<
  RegistrationType,
  {
    generalInfo: Array<keyof typeof RegistrationInternalFields>;
    userInfo: Array<keyof typeof RegistrationInternalFields>;
  }
> = {
  [RegistrationType.guardianForStudent]: {
    generalInfo: [
      "firstName",
      "lastName",
      "streetAddress",
      "city",
      "region",
      "postalCode",
      "phone",
      "schoolDistrict",
    ],
    userInfo: [
      "email",
      "password",
      "securityQuestionType",
      "securityQuestionAnswer",
    ],
  },
};
export const register = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    const type = parsedInput.type;
    const fields = parsedInput.fields as Record<string, any>;
    const generalInfo = Object.fromEntries(
      registrationFieldsByType[type].generalInfo.map((field) => [
        RegistrationInternalFields[field],
        fields[field],
      ])
    );
    const userInfo = Object.fromEntries(
      registrationFieldsByType[type].userInfo.map((field) => [
        RegistrationInternalFields[field],
        fields[field],
      ])
    );
    const query = new URLSearchParams({
      userEvent: "930",
      deploymentId: "aspen",
      actType: "0",
      validation: "",
      general: convertObjectToWeirdStringRepresentation(generalInfo),
      userInfo: convertObjectToWeirdStringRepresentation(userInfo),
    });
    const { cookies } = await getFreshAuthCookiesAndHTMLToken();
    const responseXML = await fetchMyEd(
      `accountCreation.do?${query.toString()}`,
      {
        headers: {
          Cookie: convertObjectToCookieString(cookies),
        },
      }
    ).then((res) => res.text());
    const $ = cheerio.load(responseXML, { xml: true });
    const responseElement = $("response");
    const isError = responseElement.attr("result") === "error";

    const message = responseElement.attr("message");
    if (isError) {
      return {
        success: false,
        message,
      };
    }
    const canLoginImmediately = message !== "true"; //just how it works originally
    redirect(
      `/login?registration_result=${
        canLoginImmediately ? "success" : "pending"
      }`
    );
  });

const resetPasswordModifiedErrorMessages: Record<string, string> = {
  "The login ID you entered is invalid.":
    "The username you entered is invalid.",
};
export const resetPassword = actionClient
  .schema(passwordResetSchema)
  .action(async ({ parsedInput }) => {
    const { cookies, token } = await getFreshAuthCookiesAndHTMLToken();
    const params = new URLSearchParams({
      userEvent: parsedInput.securityQuestion ? "930" : "10010",
      deploymentId: "aspen",
      username: parsedInput.username,
      email: parsedInput.email,
      [MYED_HTML_TOKEN_INPUT_NAME]: token,
      ...(parsedInput.securityQuestion
        ? {
            question: parsedInput.securityQuestion,
            answer: parsedInput.securityAnswer,
          }
        : {}),
    });
    const response = await fetchMyEd("passwordRecovery.do", {
      method: "POST",
      headers: {
        Cookie: convertObjectToCookieString(cookies),
      },
      body: params,
    });
    const responseHTML = await response.text();
    const $ = cheerio.load(responseHTML);
    const errorMessage = parseAuthGenericErrorMessage($);
    if (errorMessage) {
      let normalizedMessage =
        resetPasswordModifiedErrorMessages[errorMessage] ?? errorMessage;
      if (normalizedMessage.at(-1) !== ".") {
        normalizedMessage += ".";
      }
      return {
        success: false,
        message: normalizedMessage,
      };
    }
    const bodyOnLoadAttribute = $("body").attr("onLoad");
    let securityQuestion;
    if (!bodyOnLoadAttribute?.includes("message.email.passwordEmailSent")) {
      securityQuestion = $(
        ".logonDetailContainer tr:nth-child(5) label"
      ).text();
    }
    return {
      success: true,
      securityQuestion,
    };
  });
const changePasswordPriorityErrorMessageRegex =
  /showMessageWindow\((?:[^,]+,){4}\s*(['"`])(.*?)\1/;

export const changePassword = actionClient
  .schema(changePasswordSchema)
  .action(async ({ parsedInput }) => {
    const cookiesStore = cookies();
    const isLoggedIn = isUserAuthenticated(cookiesStore);
    let authCookies: AuthCookies;
    if (isLoggedIn) {
      const myedCookieStore = new MyEdCookieStore(cookiesStore);
      authCookies = getAuthCookies(myedCookieStore);
    } else {
      const externalCookies = parsedInput.authCookies;
      if (!externalCookies) {
        return {
          success: false,
          message: "Cookies are required.",
        };
      }
      authCookies = externalCookies;
    }
    const cookiesString = convertObjectToCookieString(authCookies);
    const loginPageResponse = await fetchMyEd("changePassword.do", {
      headers: { Cookie: cookiesString },
    });

    const htmlToken = await parseHTMLTokenFromResponse(loginPageResponse);
    const params = new URLSearchParams({
      userEvent: "140",
      deploymentId: "aspen",
      current: parsedInput.oldPassword,
      password: parsedInput.newPassword,
      confirm: parsedInput.newPassword,
      [MYED_HTML_TOKEN_INPUT_NAME]: htmlToken,
    });
    try {
      const response = await fetchMyEd("changePassword.do", {
        method: "POST",
        headers: {
          Cookie: cookiesString,
        },
        body: params,
      });
      const responseHTML = await response.text();
      const $ = cheerio.load(responseHTML);
      let priorityErrorMessage, secondaryErrorMessage;
      $("script[language='JavaScript']").each(function () {
        const scriptContent = $(this).html();
        if (!scriptContent) return;
        const priorityMatch = scriptContent.match(
          changePasswordPriorityErrorMessageRegex
        );
        if (priorityMatch) {
          priorityErrorMessage = priorityMatch[2];
          return false;
        }
        const secondaryMatch = scriptContent.match(
          genericErrorMessageVariableRegex
        );
        if (secondaryMatch) {
          secondaryErrorMessage = secondaryMatch[2];
        }
      });
      const finalErrorMessage = priorityErrorMessage ?? secondaryErrorMessage;
      if (finalErrorMessage) {
        return {
          success: false,
          message: finalErrorMessage,
        };
      }
      if (authCookies) {
        await finalizePasswordChange({
          authCookies,
          username: parsedInput.username as NonNullable<
            typeof parsedInput.username
          >,
          password: parsedInput.newPassword,
          htmlToken,
        });
      }
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
        message: "An unexpected error occurred.",
      };
    }
  });
async function finalizePasswordChange({
  authCookies,
  username,
  password,
  htmlToken,
}: {
  authCookies: AuthCookies;
  username: string;
  password: string;
  htmlToken: string;
}) {
  const params = new URLSearchParams({
    userEvent: "300",
    userParam: password,
    deploymentId: "aspen",
    username,
    password: "",
    [MYED_HTML_TOKEN_INPUT_NAME]: htmlToken,
  });
  const response = await fetchMyEd("logon.do", {
    method: "POST",
    headers: {
      Cookie: convertObjectToCookieString(authCookies),
    },
    body: params,
  });
  const responseHTML = await response.text();
  const $ = cheerio.load(responseHTML);
  const rawErrorMessage = parseAuthGenericErrorMessage($);
  if (rawErrorMessage) {
    const errorMessage =
      rawLoginErrorMessageToIDMap[rawErrorMessage] ?? rawErrorMessage;
    throw new LoginError(errorMessage);
  }
}
