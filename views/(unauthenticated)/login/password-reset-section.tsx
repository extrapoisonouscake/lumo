import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useFormValidation } from "@/hooks/use-form-validation";

import { isTRPCError } from "@/lib/trpc/helpers";
import {
  PasswordResetSchema,
  passwordResetSchema,
} from "@/lib/trpc/routes/myed/auth/public";
import { trpc } from "@/views/trpc";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

export function PasswordResetSection({
  setLoginFormValues,
  getInitialUsername,
  isOpen,
  setIsOpen,
}: {
  setLoginFormValues: (newUsername: string) => void;
  getInitialUsername: () => string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const form = useFormValidation(passwordResetSchema);
  const { errorMessage, setErrorMessage, errorMessageNode } =
    useFormErrorMessage();

  const sendPasswordResetEmailMutation = useMutation(
    trpc.myed.auth.sendPasswordResetEmail.mutationOptions()
  );
  const onSubmit = async (data: PasswordResetSchema) => {
    if (errorMessage) {
      setErrorMessage(null);
    }
    try {
      await sendPasswordResetEmailMutation.mutateAsync(data);

      toast.success("A password reset link has been sent to your email.");
      setIsOpen(false);
      setErrorMessage(null);

      setLoginFormValues(data.username);
      form.reset();
    } catch (e) {
      if (isTRPCError(e)) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  // Update form values when initial username changes
  useEffect(() => {
    if (isOpen) {
      const currentUsername = getInitialUsername();
      form.setValue("username", currentUsername);
    }
  }, [isOpen, getInitialUsername, form]);

  return (
    <>
      <p
        className="text-sm text-secondary-foreground cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Forgot password?
      </p>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <Form {...form} onSubmit={onSubmit} className="gap-0">
            {errorMessageNode}

            <div className="flex flex-col gap-3">
              <FormInput
                placeholder="1234567"
                name="username"
                label="Username"
              />

              <SubmitButton>Submit</SubmitButton>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
