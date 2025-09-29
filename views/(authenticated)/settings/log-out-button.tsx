"use client";
import { Button } from "@/components/ui/button";
import { useLogOut } from "@/hooks/trpc/use-log-out";
import { LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router";

export function LogOutButton() {
  const navigate = useNavigate();

  const logOutMutation = useLogOut(navigate);

  return (
    <Button
      disabled={logOutMutation.isPending}
      variant="outline"
      className="sm:hidden"
      onClick={() => logOutMutation.mutateAsync()}
      rightIcon={<LogOutIcon />}
      shouldShowChildrenOnLoading
    >
      Sign Out
    </Button>
  );
}
