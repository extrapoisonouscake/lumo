import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../../trpc";

export function GuestModeButton() {
  const enterGuestModeMutation = useMutation(
    trpc.auth.enterGuestMode.mutationOptions()
  );
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => enterGuestModeMutation.mutateAsync()}
    >
      Continue as guest
    </Button>
  );
}
