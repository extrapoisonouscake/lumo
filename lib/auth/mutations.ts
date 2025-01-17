"use server";
import { loginSchema, LoginSchema } from "@/app/login/validation";
import { deleteSessionAndLogOut, performLogin } from "./helpers";

export async function login(formData: LoginSchema) {
  try {
    loginSchema.parse(formData);
  } catch {
    return { errorID: "invalid-parameters" };
  }

  try {
    await performLogin(formData);
  } catch (e: any) {
    console.log(e);
    return {
      errorID: e.message
        || "An unexpected error occurred. Try again later.",
    };
  }
}

export async function logOut() {
  await deleteSessionAndLogOut();
}
