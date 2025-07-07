"use client";
import { Button } from "@/components/ui/button";
import { useLogOut } from "@/hooks/trpc/use-log-out";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogOutButton() {
  const router = useRouter();

  const logOutMutation = useLogOut(router.push);
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <Button
      disabled={logOutMutation.isPending}
      variant="outline"
      onClick={() => logOutMutation.mutateAsync()}
      rightIcon={<LogOutIcon />}
      shouldShowChildrenOnLoading
    >
      Sign Out
    </Button>
  );
}
