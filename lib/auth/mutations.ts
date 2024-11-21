"use server";
import { LoginSchema, loginSchema } from "@/app/login/validation";
import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/myed/sendMyEdRequest";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser } from "./helpers";
const KNOWN_ERRORS = ["Invalid login.", "This account has been disabled."];
const COOKIE_MAX_AGE = 34560000;
const shouldSecureCookies = process.env.NODE_ENV !== "development";
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
      cookieStore.set(name, value || "", {
        secure: shouldSecureCookies,
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
      });
    }
    cookieStore.set("username", username, {
      secure: shouldSecureCookies,
      maxAge: COOKIE_MAX_AGE,
    });
    cookieStore.set("password", password, {
      secure: shouldSecureCookies,
      maxAge: COOKIE_MAX_AGE,
    });
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
  cookieStore.delete("username");
  cookieStore.delete("password");
  redirect("/login");
}
