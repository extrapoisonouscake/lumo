"use server";
import { loginSchema, LoginSchema } from "@/app/login/validation";
import { deleteSessionAndLogOut, performLogin } from "./helpers";
const KNOWN_ERRORS = ["Invalid login.", "This account has been disabled."];

export async function login(formData: LoginSchema) {
  try {
    loginSchema.parse(formData);
  } catch {
    return { message: "Invalid parameters." };
  }

  try {
    await performLogin(formData);
  } catch (e: any) {
    console.log(e);
    const { message } = e;
    return {
      message: KNOWN_ERRORS.includes(message)
        ? message
        : "An unexpected error occurred. Try again later.",
    };
  }
}

export async function logOut() {
  await deleteSessionAndLogOut();
}
