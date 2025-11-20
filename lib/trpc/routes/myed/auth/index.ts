import { db } from "@/db";
import { convertObjectToCookieString } from "@/helpers/convertObjectToCookieString";
import { fetchMyEd, MyEdBaseURLs } from "@/instances/fetchMyEd";
import { z } from "zod";

import { publicProcedure, router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";
import {
  deleteSession,
  fetchAuthCookies,
  getFreshAuthCookies,
  performLogin,
  setUpSessionTokens,
} from "./utils";
import {
  isKnownLoginError,
  LoginErrors,
  loginSchema,
  passwordResetSchema,
  registerSchema,
  RegistrationInternalFields,
  RegistrationType,
} from "./public";

import { AUTH_COOKIES_NAMES } from "@/constants/auth";
import { users } from "@/db/schema";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { PasswordRequirements } from "@/types/auth";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { after } from "next/server";

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

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    try {
      await performLogin(input);
    } catch (e: any) {
      console.log(e);
      const safeErrorMessage: LoginErrors = isKnownLoginError(e.message)
        ? e.message
        : LoginErrors.unexpectedError;
      throw new TRPCError({ code: "BAD_GATEWAY", message: safeErrorMessage });
    }
  }),
  getRegistrationFields: publicProcedure.query(async ({ ctx }) => {
    
    if(true){
        throw new TRPCError({ code: "NOT_IMPLEMENTED" });
        
      }
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
  }),

  sendPasswordResetEmail,

  ensureValidSession: authenticatedProcedure
    .input(z.object({ isInBackground: z.boolean().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      if (ctx.tokens) {
        const expiresAt = ctx.authCookieStore.get(
          AUTH_COOKIES_NAMES.tokensExpireAt
        )?.value;
        if (expiresAt && dayjs(expiresAt).diff(new Date(), "minute") > 5) {
          return;
        }
      }
      try {
        const tokens = await fetchAuthCookies(
          ctx.credentials.username,
          ctx.credentials.password
        );

        await Promise.all([
          getMyEd({
            authCookies: tokens,
            myedUser: ctx.myedUser,
            targetId: ctx.targetId,
          })("normalizeInternalLanguage"),
          setUpSessionTokens({ tokens, store: ctx.authCookieStore }),
        ]);

        if (!input?.isInBackground) {
          after(async () => {
            await db
              .update(users)
              .set({ lastLoggedInAt: new Date() })
              .where(eq(users.id, ctx.myedUser.id));
          });
        }
      } catch {
        await deleteSession();
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
