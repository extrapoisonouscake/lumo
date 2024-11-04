import { isUserAuthenticated } from "@/helpers/isUserAuthenticated";
import { cookies } from "next/headers";
import { LogOutButton } from "./content";

export async function LogOut() {
  const isAuthenticated = isUserAuthenticated(cookies());
  if (!isAuthenticated) return null;
  return <LogOutButton />;
}
