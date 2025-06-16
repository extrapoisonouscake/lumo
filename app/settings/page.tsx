import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { useAuthStatus } from "@/components/providers/auth-status-provider";
import { Button } from "@/components/ui/button";
import { useLogOut } from "@/hooks/trpc/use-log-out";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOutIcon } from "lucide-react";
import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { SettingsContent } from ".";
export const metadata: Metadata = {
  title: "Settings",
};
export default function Page() {
  return (
    <PageDataProvider>
      <PageHeading />

      <div className="flex flex-col gap-4">
        <SettingsContent />
        <LogOutButton />
      </div>
    </PageDataProvider>
  );
}

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
