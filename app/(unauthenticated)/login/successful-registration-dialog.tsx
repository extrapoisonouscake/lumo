import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "nextjs-toploader/app";

import { useState } from "react";

export function SuccessfulRegistrationDialog({
  hideDialog,
}: {
  hideDialog: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setTimeout(() => {
            hideDialog();
            router.replace("/login");
          }, 500);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Successfully registered!</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          A verification email will be sent to the address you specified. Please
          click on the confirmation link in the email to verify your address.
          Once completed, your account will be activated and you'll be able to
          login using the email and password you just entered.
        </p>
      </DialogContent>
    </Dialog>
  );
}
