"use client";

import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/auth/mutations";

export function LogOutButton() {
  return <Button onClick={() => logOut()}>Log out</Button>;
}
