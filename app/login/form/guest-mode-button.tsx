import { useSidebarVisibility } from "@/components/layout/app-sidebar-wrapper";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../../trpc";

export function GuestModeButton() {
  const enterGuestModeMutation = useMutation(
    trpc.auth.enterGuestMode.mutationOptions()
  );
  const { setIsSidebarVisible } = useSidebarVisibility();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await enterGuestModeMutation.mutateAsync();
        setIsSidebarVisible(true);
      }}
    >
      Continue as guest
    </Button>
  );
}
