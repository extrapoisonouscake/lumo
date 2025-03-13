import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { USER_SETTINGS_COOKIE_PREFIX } from "@/constants/core";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  const { key, value } = await request.json();
  cookies().set(`${USER_SETTINGS_COOKIE_PREFIX}.${key}`, `${value}` || "", {
    secure: shouldSecureCookies,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
  });
  return new Response(undefined, { status: 204 });
}
