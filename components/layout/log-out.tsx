"use client";

import { trpc } from "@/app/trpc";
import { Spinner } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useMutation } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSidebarVisibility } from "./app-sidebar-wrapper";
export function LogOutButton() {
  const logOutMutation = useMutation(trpc.auth.logOut.mutationOptions());
  const router = useRouter();
  const { setIsSidebarVisible } = useSidebarVisibility();
  return (
    <SidebarMenuButton
      shouldCloseSidebarOnMobile={false}
      disabled={logOutMutation.isPending}
      onClick={async () => {
        await logOutMutation.mutateAsync();
        router.push("/login");
        setIsSidebarVisible(false);
      }}
    >
      {logOutMutation.isPending ? <Spinner /> : <LogOutIcon />}
      Log out
    </SidebarMenuButton>
  );
}
