import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { fetchMyEd } from "@/instances/fetchMyEd";
import * as cheerio from "cheerio";
import { z } from "zod";
import { publicProcedure, router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";
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

import { AUTH_COOKIES_NAMES } from "@/constants/auth";
import { MYED_HTML_TOKEN_INPUT_NAME } from "@/constants/myed";
import { AuthCookies, getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { TRPCError } from "@trpc/server";
import { isAuthenticatedContext } from "../../../context";
import { fetchAuthCookiesAndStudentID } from "./helpers";

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

const register = publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }) => {
    const type = input.type;
    const fields = input.fields as Record<string, any>;
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
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
    }
    const canLoginImmediately = message !== "true"; //just how it works originally
    return { canLoginImmediately };
  });

const resetPasswordModifiedErrorMessages: Record<string, string> = {
  "The login ID you entered is invalid.":
    "The username you entered is invalid.",
};

const resetPassword = publicProcedure
  .input(passwordResetSchema)
  .mutation(async ({ input }) => {
    const { cookies, token } = await getFreshAuthCookiesAndHTMLToken();
    const params = new URLSearchParams({
      userEvent: input.securityQuestion ? "930" : "10010",
      deploymentId: "aspen",
      username: input.username,
      email: input.email,
      [MYED_HTML_TOKEN_INPUT_NAME]: token,
      ...(input.securityQuestion
        ? {
            question: input.securityQuestion,
            answer: input.securityAnswer,
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
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: normalizedMessage,
      });
    }
    const bodyOnLoadAttribute = $("body").attr("onLoad");
    let securityQuestion;
    if (!bodyOnLoadAttribute?.includes("message.email.passwordEmailSent")) {
      securityQuestion = $(
        ".logonDetailContainer tr:nth-child(5) label"
      ).text();
    }
    return {
      securityQuestion,
    };
  });

const changePasswordPriorityErrorMessageRegex =
  /showMessageWindow\((?:[^,]+,){4}\s*(['"`])(.*?)\1/;

const changePassword = publicProcedure
  .input(changePasswordSchema)
  .mutation(async ({ input, ctx }) => {
    const isLoggedIn = isAuthenticatedContext(ctx);
    let authCookies: AuthCookies;
    if (isLoggedIn) {
      const myedCookieStore = await MyEdCookieStore.create();
      authCookies = getAuthCookies(myedCookieStore);
    } else {
      const externalCookies = input.authCookies;
      if (!externalCookies) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cookies are required.",
        });
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
      current: input.oldPassword,
      password: input.newPassword,
      confirm: input.newPassword,
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: finalErrorMessage,
        });
      }
      if (authCookies) {
        await finalizePasswordChange({
          authCookies,
          username: input.username as NonNullable<typeof input.username>,
          password: input.newPassword,
          htmlToken,
        });
      }
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      });
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

type LoginResponse =
  | { success: true }
  | { success: false; message: LoginErrors; authCookies?: AuthCookies };

export const authRouter = router({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }): Promise<LoginResponse> => {
      try {
        await performLogin(input);
        return {
          success: true,
        };
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
    }),
  forceLogin: publicProcedure
    .input(
      z.object({ authCookies: authCookiesSchema, credentials: loginSchema })
    )
    .mutation(async ({ input: { authCookies, credentials } }) => {
      const studentID = await fetchStudentID(authCookies);
      await setUpLogin({
        tokens: authCookies,
        credentials,
        studentID,
      });
    }),
  getRegistrationFields: publicProcedure.query(async ({ ctx }) => {
    const fields = await ctx.getMyEd("registrationFields");
    return { ip: ctx.ip, ...fields };
  }),
  register,
  logOut: authenticatedProcedure.mutation(async () => {
    await deleteSession();
  }),
  changePassword,
  resetPassword,
  //* if the name is changed, change in trpc client initialization as well
  ensureValidSession: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (ctx.tokens) {
      return; // Session is valid, no need to refresh
    }

    try {
      const { tokens } = await fetchAuthCookiesAndStudentID(
        ctx.credentials.username,
        ctx.credentials.password
      );

      ctx.authCookieStore.set(
        AUTH_COOKIES_NAMES.tokens,
        convertObjectToCookieString(tokens, false),
        {
          maxAge: 60 * 60,
        }
      );
    } catch {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }),
});
