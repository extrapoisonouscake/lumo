"use client";

import { Spinner } from "@/components/ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { logOut } from "@/lib/auth/mutations";
import { LogOutIcon } from "lucide-react";
import { useState } from "react";
export function LogOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
          await logOut();
          setIsLoading(false);
        }}
      >
        {isLoading ? <Spinner /> : <LogOutIcon />}
        Log out
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
