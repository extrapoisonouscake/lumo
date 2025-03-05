"use client";

import { Spinner } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { exitGuestMode } from "@/lib/auth/mutations";
import { LogInIcon } from "lucide-react";
import { useState } from "react";
export function LogInButton() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <SidebarMenuButton
      shouldCloseSidebarOnMobile={false}
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        await exitGuestMode();
        setIsLoading(false);
      }}
    >
      {isLoading ? <Spinner /> : <LogInIcon />}
      Log In
    </SidebarMenuButton>
  );
}
