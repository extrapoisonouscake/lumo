import { getFullCookieName } from "@/helpers/getFullCookieName";
import { cookies } from "next/headers";
import { LogOutButton } from "./Content";

export async function LogOut() {
  const isLogged = cookies().has(getFullCookieName("JSESSIONID"));
  if (!isLogged) return null;
  return <LogOutButton />;
}
