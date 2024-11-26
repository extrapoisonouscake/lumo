"use server";
import { LoginSchema } from "@/app/login/validation";
import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { sendMyEdRequest } from "@/parsing/myed/sendMyEdRequest";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateUser } from "./helpers";
const KNOWN_ERRORS = ["Invalid login.", "This account has been disabled."];

export async function login(formData?: LoginSchema) {
  try {
    const cookieStore = new MyEdCookieStore(cookies());
    const { username, password } = formData || {
      username: cookieStore.get("username")?.value,
      password: cookieStore.get("password")?.value,
    };
    if (!username || !password) return { message: "Invalid parameters." };
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
    if (formData) {
      cookieStore.set("username", username, {
        secure: shouldSecureCookies,
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
      });
      cookieStore.set("password", password, {
        secure: shouldSecureCookies,
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
      });
    }
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
  const url = getEndpointUrl("logout");
  await sendMyEdRequest(url, getAuthCookies(cookieStore));
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    cookieStore.delete(name);
  }
  cookieStore.delete("username");
  cookieStore.delete("password");
  redirect("/login");
}
