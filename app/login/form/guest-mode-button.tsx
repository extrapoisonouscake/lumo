import { useAuthStatus } from "@/components/providers/auth-status-provider";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../../trpc";

export function GuestModeButton() {
  const enterGuestModeMutation = useMutation(
    trpc.auth.enterGuestMode.mutationOptions()
  );
  const { refreshAuthStatus } = useAuthStatus();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await enterGuestModeMutation.mutateAsync();
        refreshAuthStatus();
      }}
    >
      Continue as guest
    </Button>
  );
}
