"use server";
import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { SCHOOL_COOKIE_NAME } from "@/constants/cookies";
import { KnownSchools } from "@/constants/schools";
import { cookies } from "next/headers";

export async function setSchool(school: KnownSchools | undefined) {
  cookies().set(SCHOOL_COOKIE_NAME, school || "", {
    secure: shouldSecureCookies,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
  });
}
