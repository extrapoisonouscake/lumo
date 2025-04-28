import { useAuthStatus } from "@/components/providers/auth-status-provider";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { trpc } from "../../trpc";
export function GuestModeButton() {
  const enterGuestModeMutation = useMutation(
    trpc.myed.auth.enterGuestMode.mutationOptions()
  );
  const { refreshAuthStatus } = useAuthStatus();
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await enterGuestModeMutation.mutateAsync();

        refreshAuthStatus();
        router.push("/");
      }}
    >
      Continue as guest
    </Button>
  );
}
