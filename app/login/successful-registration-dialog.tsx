import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

import { useState } from "react";

export function SuccessfulRegistrationDialog({
  result,
  setResult,
}: {
  result: "success" | "pending";
  setResult: (newResult: typeof result | null) => void;
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
            setResult(null);
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
          {result === "success"
            ? "A confirmation email will be sent to the address you specified. You may now log into MyEducationBC. Use your email address and the password you provided during the request process."
            : "A verification email will be sent to the email address you specified. Please click on the confirmation link in the email to activate your account. Check your spam folder if you don't see it in your inbox."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
