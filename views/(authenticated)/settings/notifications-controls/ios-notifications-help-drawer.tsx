import {
  AppStoreAppCombinedLogo,
  IOSAppFeaturesList,
  IOSAppInstallButton,
} from "@/components/layout/ios-app-advertisement";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

export function IOSNotificationsHelpDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="flex flex-col items-center gap-4 pb-4 px-6 pt-0">
        <AppStoreAppCombinedLogo className="mt-2" />
        <div className="flex flex-col gap-2 items-center">
          <ResponsiveDialogTitle className="text-2xl text-center">
            Get our app for notifications
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-center">
            To stay updated with notifications, you'll need to install our app.
            It's quick and easy!
          </ResponsiveDialogDescription>
        </div>
        <IOSAppFeaturesList />
        <IOSAppInstallButton />
        <p className="text-xs text-center text-muted-foreground">
          App Store is a trademark of Apple Inc.
        </p>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
