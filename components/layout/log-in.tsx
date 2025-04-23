"use client";

import { trpc } from "@/app/trpc";
import { Spinner } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useMutation } from "@tanstack/react-query";
import { LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSidebarVisibility } from "./app-sidebar-wrapper";
export function LogInButton() {
  const exitGuestModeMutation = useMutation(
    trpc.auth.exitGuestMode.mutationOptions()
  );
  const router = useRouter();
  const { setIsSidebarVisible } = useSidebarVisibility();
  return (
    <SidebarMenuButton
      shouldCloseSidebarOnMobile={false}
      disabled={exitGuestModeMutation.isPending}
      onClick={async () => {
        await exitGuestModeMutation.mutateAsync();
        router.push("/login");
        setIsSidebarVisible(false);
      }}
    >
      {exitGuestModeMutation.isPending ? <Spinner /> : <LogInIcon />}
      Log in
    </SidebarMenuButton>
  );
}
