"use server";
import { loginSchema, LoginSchema } from "@/app/login/validation";
import { redirect } from "next/navigation";
import { deleteSessionAndLogOut, performLogin } from "./helpers";
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
    redirect("/");
  } catch (e: any) {
    const message =
      e.message || "An unexpected error occurred. Try again later.";
    redirectToLoginWithError(message);
  }
}

export async function logOut() {
  await deleteSessionAndLogOut();
}
