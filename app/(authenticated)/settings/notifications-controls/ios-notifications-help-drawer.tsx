import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
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
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add to Home Screen</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Your iPhone requires you to add this website to your home screen to
            receive notifications.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <Steps />
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button className="w-full">Got it!</Button>
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
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
