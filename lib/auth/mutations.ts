"use server";
import { loginSchema, LoginSchema } from "@/app/login/validation";
import { redirect } from "next/navigation";
import { deleteSessionAndLogOut, performLogin } from "./helpers";
import { isKnownLoginError, LoginError } from "./public";
const redirectToLoginWithError = (error: string) => {
  redirect(`/login?error=${error}`);
};
export async function login(formData: LoginSchema) {
  try {
    loginSchema.parse(formData);
  } catch {
    redirectToLoginWithError("invalid-parameters");
  }
  try {
    await performLogin(formData);
  } catch (e: any) {
    const { message } = e;
    const safeErrorMessage: LoginError = isKnownLoginError(message)
      ? message
      : "unexpected-error";
    redirectToLoginWithError(safeErrorMessage);
  }
  redirect("/");
}

export async function logOut() {
  await deleteSessionAndLogOut();
}
