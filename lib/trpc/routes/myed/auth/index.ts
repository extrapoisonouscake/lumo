import { db } from "@/db";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { fetchMyEd, MyEdBaseURLs } from "@/instances/fetchMyEd";
import { z } from "zod";

import { publicProcedure, router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";
import {
  deleteSession,
  fetchStudentId,
  getFreshAuthCookies,
  performLogin,
  setUpLogin,
} from "./helpers";
import {
  authCookiesSchema,
  isKnownLoginError,
  LoginErrors,
  loginSchema,
  passwordResetSchema,
  registerSchema,
  RegistrationInternalFields,
  RegistrationType,
} from "./public";

import { AUTH_COOKIES_NAMES } from "@/constants/auth";
import {
  USER_CACHE_COOKIE_PREFIX,
  USER_SETTINGS_COOKIE_PREFIX,
} from "@/constants/core";
import { users } from "@/db/schema";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { PasswordRequirements } from "@/types/auth";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { fetchAuthCookiesAndStudentId } from "./helpers";

const registrationFieldsByType: Record<
  RegistrationType,
  {
    addressInfo: Array<keyof typeof RegistrationInternalFields>;
    personalInfo: Array<keyof typeof RegistrationInternalFields>;
    userInfo: Array<keyof typeof RegistrationInternalFields>;
  }
> = {
  [RegistrationType.guardianForStudent]: {
    addressInfo: ["streetAddress", "poBox", "city", "region", "postalCode"],
    personalInfo: ["firstName", "lastName", "phone", "email", "schoolDistrict"],
    userInfo: [
      "password",
      "schoolDistrict",
      "securityQuestionType",
      "securityQuestionAnswer",
    ],
  },
};
const REGISTRATION_PRETTIFIED_ERROR_MESSAGES: Record<string, string> = {
  "Validation successful, but an account already exists for the person associated with this data.":
    "The email address you provided is already in use.",
};
const register = publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }) => {
    const type = input.type;
    const fields = input.fields as Record<string, any>;
    const fieldsWithType = registrationFieldsByType[type];
    const mapFieldsToInternalFields = (
      field: keyof typeof RegistrationInternalFields
    ) => [RegistrationInternalFields[field], fields[field]];

    const addressInfo = Object.fromEntries(
      fieldsWithType.addressInfo.map(mapFieldsToInternalFields)
    );
    const personalInfo = Object.fromEntries(
      fieldsWithType.personalInfo.map(mapFieldsToInternalFields)
    );
    const userInfo = {
      ...Object.fromEntries(
        fieldsWithType.userInfo.map(mapFieldsToInternalFields)
      ),
      preferredLocale: "en_US",
      loginName: fields.email,
    };
    const body = {
      addressModel: addressInfo,
      personModel: personalInfo,
      userModel: userInfo,
    };

    try {
      await fetchMyEd<{
        userOid: string;
        personOid: string;
        addressOid: string;
      }>(
        `/account`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        },
        MyEdBaseURLs.NEW
      );
    } catch (e: any) {
      const body = (await e.json()) as { code: number; message: string };
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          REGISTRATION_PRETTIFIED_ERROR_MESSAGES[body.message] ?? body.message,
      });
    }
  });
//the keys are common parts of known error messages
const resetPasswordErrorMessagesModifiers: Record<
  string,
  (message: string) => string
> = {
  "Unable to find user with login id": () =>
    `We couldn't find a user with such username.`,
  "Password recovery is disabled for user": () =>
    `Password recovery is disabled for this user.`,
};

const sendPasswordResetEmail = publicProcedure
  .input(passwordResetSchema)
  .mutation(async ({ input }) => {
    const cookies = await getFreshAuthCookies();
    const params = new URLSearchParams({
      loginId: input.username,
      source: "logon",
    });
    try {
      await fetchMyEd<void | { code: number; message: string }>(
        "/auth/passwordRecovery",
        {
          method: "POST",
          headers: {
            Cookie: convertObjectToCookieString(cookies),
          },
          body: params,
        },
        MyEdBaseURLs.NEW
      );
    } catch (e: any) {
      const body = (await e.json()) as Exclude<
        Awaited<ReturnType<typeof e.json>>,
        void
      >;
      const modifier = Object.entries(resetPasswordErrorMessagesModifiers).find(
        ([fragment]) => body.message.includes(fragment)
      )?.[1];
      const normalizedMessage = modifier
        ? modifier(body.message)
        : body.message;
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: normalizedMessage,
      });
    }
  });

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
      const studentId = await fetchStudentId(authCookies);
      await setUpLogin({
        tokens: authCookies,
        credentials,
        studentId,
      });
    }),
  getRegistrationFields: publicProcedure.query(async ({ ctx }) => {
    const response = await fetchMyEd<{
      cities: string[];
      securityQuestions: string[];
      states: string[];
      lowestLevelOrganizations: Record<string, string>;
      passwordRecoveryEnabled: boolean;
      minimumAnswerLength: number;
      passwordMinLength: number;
      passwordRequireMixedCaseEnabled: boolean;
      passwordRequireDigitsEnabled: boolean;
      passwordRequireNonAlphaEnabled: boolean;
      passwordValidateWithHeuristicsEnabled: boolean;
    }>("/account/accountCreationConfig", {}, MyEdBaseURLs.NEW);
    const body = await response.json();
    return {
      ip: ctx.ip,
      schoolDistricts: body.lowestLevelOrganizations,
      securityQuestions: body.securityQuestions,
      passwordRequirements: {
        minLength: body.passwordMinLength,
        requireMixedCase: body.passwordRequireMixedCaseEnabled,
        requireDigits: body.passwordRequireDigitsEnabled,
        requireNonAlpha: body.passwordRequireNonAlphaEnabled,
      } satisfies PasswordRequirements,
      securityQuestionRequirements: {
        minLength: body.minimumAnswerLength,
      },
    };
  }),
  register,

  logOut: authenticatedProcedure.mutation(async ({ ctx: { cookieStore } }) => {
    await deleteSession();
    cookieStore.delete(USER_CACHE_COOKIE_PREFIX);
    cookieStore.delete(USER_SETTINGS_COOKIE_PREFIX);
  }),

  sendPasswordResetEmail,
  //* if the name is changed, change in trpc client initialization as well
  ensureValidSession: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (ctx.tokens) {
      return; // Session is valid, no need to refresh
    }
    try {
      const { tokens } = await fetchAuthCookiesAndStudentId(
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
      after(() => {
        db.update(users)
          .set({ lastLoggedInAt: new Date() })
          .where(eq(users.id, ctx.studentHashedId));
      });
    } catch {
      await deleteSession();
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }),
});
