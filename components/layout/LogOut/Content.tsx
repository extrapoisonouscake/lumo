"use client";

import { logOut } from "@/lib/auth/mutations";
import { Button } from "@nextui-org/button";

export function LogOutButton() {
  return <Button onClick={() => logOut()}>Log out</Button>;
}
