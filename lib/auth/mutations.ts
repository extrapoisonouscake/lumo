"use server";
import { LoginSchema, loginSchema } from "@/app/login/validation";
import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { getFullCookieName } from "@/helpers/getFullCookieName";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser } from "./helpers";
const KNOWN_ERRORS = ["Invalid login.", "This account has been disabled."];
export async function login(formData: LoginSchema) {
  console.log("SSSS");
  try {
    try {
      loginSchema.parse(formData);
    } catch {
      return { message: "Invalid parameters." };
    }
    const { username, password } = formData;
    console.log(":sss");
    const r = await authenticateUser(username, password);
    console.log({ r });
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    const { message } = e;
    return {
      message: KNOWN_ERRORS.includes(message)
        ? message
        : "An unexpected error occurred. Try again later.",
    };
  }
  redirect("/grades");
}
export async function logOut() {
  const cookieStore = cookies();
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(getFullCookieName(name));
  }
  redirect("/login");
}
