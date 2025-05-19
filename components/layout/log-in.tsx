"use client";

import { trpc } from "@/app/trpc";
import { Spinner } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useMutation } from "@tanstack/react-query";
import { LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "../providers/auth-status-provider";
export function LogInButton() {
  const exitGuestModeMutation = useMutation(
    trpc.myed.auth.exitGuestMode.mutationOptions()
  );
  const router = useRouter();
  const { refreshAuthStatus } = useAuthStatus();
  return (
    <SidebarMenuButton
      shouldCloseSidebarOnMobile={false}
      disabled={exitGuestModeMutation.isPending}
      onClick={async () => {
        await exitGuestModeMutation.mutateAsync();
        router.push("/login");
        refreshAuthStatus();
      }}
    >
      {exitGuestModeMutation.isPending ? <Spinner /> : <LogInIcon />}
      Sign in
    </SidebarMenuButton>
  );
}
