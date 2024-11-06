"use client";

import { login } from "@/lib/auth/mutations";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { SESSION_EXPIRED_ERROR_MESSAGE } from "@/constants/auth";
import { getFullCookieName } from "@/helpers/getFullCookieName";
import { ErrorComponentProps } from "@/types/ui";
import Cookies from "js-cookie";
export function ReloginWrapper({ error: { message } }: ErrorComponentProps) {
  const router = useRouter();
  const sessionExpired = message === SESSION_EXPIRED_ERROR_MESSAGE;
  useEffect(() => {
    if (!sessionExpired) return;
    const username = Cookies.get(getFullCookieName("username"));
    const password = Cookies.get(getFullCookieName("password"));
    if (!username || !password) {
      router.push("/login");
      return;
    }
    login({ username, password }).then((res) => {
      if (res) {
        router.push(`/login?message=${res.message}`);
      } else {
        window.location.reload();
      }
    });
  }, []);
  if (sessionExpired) {
    return <p>Loading...</p>;
  }
  return <p>Error: {message}</p>;
}
