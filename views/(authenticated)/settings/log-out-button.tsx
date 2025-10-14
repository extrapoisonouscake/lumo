"use client";
import { Button } from "@/components/ui/button";
import { useLogOut } from "@/hooks/trpc/use-log-out";
import { Logout05StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

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
      rightIcon={<HugeiconsIcon icon={Logout05StrokeRounded} />}
      shouldShowChildrenOnLoading
    >
      Sign Out
    </Button>
  );
}
