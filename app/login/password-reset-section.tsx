import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog
} from "@/components/ui/dialog";

import { ErrorAlert } from "@/components/ui/error-alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { resetPassword } from "@/lib/auth/mutations";
import { PasswordResetSchema, passwordResetSchema } from "@/lib/auth/public";
import { isActionResponseSuccess } from "@/lib/helpers";
import { useState } from "react";
import { toast } from "sonner";

export function PasswordResetSection() {
  const [isOpen, setIsOpen] = useState(false);
  const form = useFormValidation(passwordResetSchema);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [securityQuestion, setSecurityQuestion] = useState<string|null>(null);
  const onSubmit = async (data: PasswordResetSchema) => {
    if (errorMessage) {
      setErrorMessage(null);
    }
    const response = await resetPassword({...data,securityQuestion:securityQuestion??undefined});
    if (isActionResponseSuccess(response)) {
      const securityQuestion = response?.data?.securityQuestion; //fix types
      if (securityQuestion) {
        setSecurityQuestion(securityQuestion);
      } else {
        toast("A password reset link has been sent to your email.");
        setIsOpen(false);
        setErrorMessage(null)
        setSecurityQuestion(null)
        form.reset();
      }
    } else {
      setErrorMessage(response?.data?.message ?? "An unknown error occurred.");
    }
  };
  return (
    <>
      <p
        className="text-sm text-secondary-foreground cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Forgot Password?
      </p>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
          </DialogHeader>
          <Form {...form} onSubmit={onSubmit}>
            {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}

            <FormInput placeholder="1111111" name="username" label="Username" />
            <FormInput
              placeholder="student@school.ca"
              type="email"
              name="email"
              label="Email"
            />
            {securityQuestion && (
              <FormInput
                placeholder="Security Question"
                name="securityAnswer"
                label={securityQuestion}
              />
              
              
            )}
            <SubmitButton>Submit</SubmitButton>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
