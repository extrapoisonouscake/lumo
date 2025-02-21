"use server";

import { MYED_HTML_TOKEN_INPUT_NAME } from "@/constants/myed";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { fetchMyEd } from "@/instances/fetchMyEd";
import * as cheerio from "cheerio";
import { redirect } from "next/navigation";
import { actionClient } from "../safe-action";
import {
  deleteSession,
  getFreshAuthCookiesAndHTMLToken,
  performLogin,
} from "./helpers";
import {
  isKnownLoginError,
  LoginError,
  loginSchema,
  passwordResetSchema,
  registerSchema,
  RegistrationInternalFields,
  RegistrationType,
} from "./public";
const redirectWithError = (basePath: string) => (error: string) => {
  redirect(`${basePath}?error=${encodeURIComponent(error)}`);
};
export const login = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    console.log("login", parsedInput);
    try {
      await performLogin(parsedInput);
    } catch (e: any) {
      console.log("error", e);
      const { message } = e;
      const safeErrorMessage: LoginError = isKnownLoginError(message)
        ? message
        : "unexpected-error";
      redirectWithError("/login")(safeErrorMessage);
    }
    redirect("/");
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
    console.log(responseXML);
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
const resetPasswordErrorMessageVariableRegex = /var\s+msg\s*=\s*(['"])(.*?)\1;/;
const resetPasswordModifiedErrorMessages = {
  "The login ID you entered is invalid.":
    "The username you entered is invalid.",
};
export const resetPassword = actionClient
  .schema(passwordResetSchema)
  .action(async ({ parsedInput }) => {
    const { cookies, token } = await getFreshAuthCookiesAndHTMLToken();
    const params = new URLSearchParams({
      userEvent: "10010",
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
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const responseHTML = await response.text();
    const $ = cheerio.load(responseHTML);
    let errorMessage: string | null = null;
    $('script[language="JavaScript"]').each(function () {
      const scriptContent = $(this).html();
      if (!scriptContent) return;
      console.log(1, scriptContent);
      const match = scriptContent.match(resetPasswordErrorMessageVariableRegex);
      if (match) {
        errorMessage = match[2];
        return false;
      }
    });
    if (errorMessage) {
      return {
        success: false,
        message:
          resetPasswordModifiedErrorMessages[errorMessage] ?? errorMessage,
      };
    }
    const bodyOnLoadAttribute = $("body").attr("onLoad");
    let securityQuestion;
    if (!bodyOnLoadAttribute.includes("message.email.passwordEmailSent")) {
      securityQuestion = $(
        ".logonDetailContainer:nth-child(2) tr:nth-child(5) label"
      ).text();
    }
    return {
      success: true,
      securityQuestion,
    };
  });
