import { useAuthStatus } from "@/components/providers/auth-status-provider";
import { Button } from "@/components/ui/button";
import { useLogOut } from "@/hooks/trpc/use-log-out";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

function LogOutButton() {
  const router = useRouter();
  const { refreshAuthStatus } = useAuthStatus();
  const logOutMutation = useLogOut(router.push, refreshAuthStatus);
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <Button
      disabled={logOutMutation.isPending}
      variant="outline"
      onClick={() => logOutMutation.mutateAsync()}
      leftIcon={<LogOutIcon />}
      shouldShowChildrenOnLoading
    >
      Sign Out
    </Button>
  );
}
