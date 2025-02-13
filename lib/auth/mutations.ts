"use server";
import { redirect } from "next/navigation";
import { actionClient } from "../safe-action";
import { deleteSessionAndLogOut, performLogin } from "./helpers";
import {
  isKnownLoginError,
  LoginError,
  loginSchema,
  registerSchema,
} from "./public";
const redirectToLoginWithError = (error: string) => {
  redirect(`/login?error=${error}`);
};
export const login = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    try {
      await performLogin(parsedInput);
    } catch (e: any) {
      const { message } = e;
      const safeErrorMessage: LoginError = isKnownLoginError(message)
        ? message
        : "unexpected-error";
      redirectToLoginWithError(safeErrorMessage);
    }
    redirect("/");
  });

export const logOut = actionClient.action(async () => {
  await deleteSessionAndLogOut();
});
export const register = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    console.log({ parsedInput });
    redirect("/login");
  });
