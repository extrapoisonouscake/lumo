"use client";
import { Button } from "@/components/ui/button";
import { useLogOut } from "@/hooks/trpc/use-log-out";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogOutButton() {
  const router = useRouter();

  const logOutMutation = useLogOut(router.push);
  
  return (
    <Button
      disabled={logOutMutation.isPending}
      variant="outline"
className="hidden sm:flex"
      onClick={() => logOutMutation.mutateAsync()}
      rightIcon={<LogOutIcon />}
      shouldShowChildrenOnLoading
    >
      Sign Out
    </Button>
  );
}
