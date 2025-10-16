import {
  AppStoreAppCombinedLogo,
  IOSAppFeaturesList,
  IOSAppInstallButton,
} from "@/components/layout/ios-app-advertisement";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Check, Share2, Smartphone } from "lucide-react";
const steps = [
  {
    title: "Tap the Share button",
    description: "Located in your browser's toolbar",
    icon: Share2,
    color: "blue",
  },
  {
    title: 'Tap "Add to Home Screen"',
    description: "Select this option from the share menu",
    icon: Smartphone,
    color: "green",
  },
  {
    title: 'Tap "Add"',
    description: "Confirm the addition to your home screen",
    icon: Check,
    color: "purple",
  },
];
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
function Steps() {
  return (
    <ResponsiveDialogBody className="flex flex-col gap-4">
      {steps.map((step) => (
        <div key={step.title} className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-${step.color}-100`}
          >
            <step.icon className={`h-5 w-5 text-${step.color}-600`} />
          </div>
          <div>
            <p className="font-medium">{step.title}</p>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        </div>
      ))}
    </ResponsiveDialogBody>
  );
}
