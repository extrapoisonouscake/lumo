"use client";

import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/auth/mutations";
import { LogOutIcon } from "lucide-react";
export function LogOutButton() {
  return (
    <Button onClick={async () => await logOut()}>
      Log out
      <LogOutIcon />
    </Button>
  );
}
