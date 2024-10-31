"use client";

import { login } from "@/lib/auth/mutations";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getFullCookieName } from "@/helpers/getFullCookieName";
import Cookies from "js-cookie";
export function ReloginWrapper({ reset }: { reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
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
  return <p>Loading...</p>;
}
