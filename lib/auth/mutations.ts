"use server";
import { LoginSchema, loginSchema } from "@/app/login/validation";
import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/getMyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/sendMyEdRequest";
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
    const cookieStore = new MyEdCookieStore(cookies());
    for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
      cookieStore.delete(name);
    }
    const cookiesToAdd = await authenticateUser(username, password);
    for (const [name, value] of cookiesToAdd) {
      cookieStore.set(name, value || "", { secure: true });
    }
    cookieStore.set("username", username, { secure: false });
    cookieStore.set("password", password, { secure: false });
  } catch (e: any) {
    const { message } = e;
    return {
      message: KNOWN_ERRORS.includes(message)
        ? message
        : "An unexpected error occurred. Try again later.",
    };
  }
}
export async function logOut() {
  const cookieStore = new MyEdCookieStore(cookies());
  await sendMyEdRequest("logout", getAuthCookies(cookieStore));
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(name);
  }
  redirect("/login");
}
