"use server";
import { LoginSchema, loginSchema } from "@/app/login/validation";
import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { MyEdCookieStore } from "@/helpers/getMyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/sendMyEdRequest";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser } from "./helpers";
const KNOWN_ERRORS = ["Invalid login.", "This account has been disabled."];
export async function login(formData: LoginSchema) {
  try {
    try {
      loginSchema.parse(formData);
    } catch {
      return { message: "Invalid parameters." };
    }
    const { username, password } = formData;
    const cookiesToSet = await authenticateUser(username, password);
    const cookieStore = new MyEdCookieStore(cookies());
    for (const [name, value] of Object.entries(cookiesToSet).filter(([name]) =>
      MYED_AUTHENTICATION_COOKIES_NAMES.includes(name)
    )) {
      cookieStore.set(name, value || "");
    }

    cookieStore.set("username", username);
    cookieStore.set("password", username);
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    const { message } = e;
    return {
      message: KNOWN_ERRORS.includes(message)
        ? message
        : "An unexpected error occurred. Try again later.",
    };
  }
  redirect("/");
}
export async function logOut() {
  const cookieStore = new MyEdCookieStore(cookies());
  await sendMyEdRequest("logout", cookieStore);
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(name);
  }
  redirect("/login");
}
