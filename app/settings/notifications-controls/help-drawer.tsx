import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
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
export function HelpDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add to Home Screen</DrawerTitle>
            <DrawerDescription>
              Your phone requires you to add this website to your home screen to
              receive notifications.
            </DrawerDescription>
          </DrawerHeader>
          <Steps className="px-4" />
          <DrawerFooter>
            <DrawerClose>
              <Button className="w-full">Got it!</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Home Screen</DialogTitle>
          <DialogDescription>
            Your phone requires you to add this website to your home screen to
            receive notifications.
          </DialogDescription>
        </DialogHeader>
        <Steps />
        <DialogFooter>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function Steps({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 pb-2", className)}>
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
    </div>
  );
}
