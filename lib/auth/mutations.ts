"use server";

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
    const $ = cheerio.load(responseXML);
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
