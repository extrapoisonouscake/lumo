import { ChangePasswordForm } from "@/components/layout/change-password-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { LoginSchema } from "@/lib/trpc/routes/auth/public";

export function ChangePasswordModal({
  isOpen,

  onSuccess,
  onClose,
  authCookies,
  getCredentials,
}: {
  isOpen: boolean;

  onSuccess: () => void;
  onClose: () => void;
  authCookies?: AuthCookies;
  getCredentials: () => LoginSchema;
}) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Password Change Required</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You recently requested a password reset. Please change your password
          to continue using MyEdBC.
        </p>
        <ChangePasswordForm
          getInitialCredentials={getCredentials}
          onSuccess={() => {
            onClose();
            onSuccess();
          }}
          authCookies={authCookies}
        />
      </DialogContent>
    </Dialog>
  );
}
