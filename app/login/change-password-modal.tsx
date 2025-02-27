import { ChangePasswordForm } from "@/components/layout/change-password-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { LoginSchema } from "@/lib/auth/public";

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
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
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
