import { ExtendedFormPasswordInput } from "@/app/register/password-input";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useFormValidation } from "@/hooks/use-form-validation";
import { changePassword } from "@/lib/auth/mutations";
import {
  changePasswordSchema,
  ChangePasswordSchema,
  LoginSchema,
} from "@/lib/auth/public";
import { isActionResponseSuccess } from "@/lib/helpers";
import { Form } from "../ui/form";
import { FormInput } from "../ui/form-input";
import { FormPasswordInput } from "../ui/form-password-input";
import { SubmitButton } from "../ui/submit-button";

export function ChangePasswordForm({
  onSuccess,
  authCookies,
  getInitialCredentials,
}: {
  onSuccess: () => void;
  authCookies?: AuthCookies;
  getInitialCredentials?: () => LoginSchema;
}) {
  const initialCredentials = getInitialCredentials?.();
  const form = useFormValidation(changePasswordSchema, {
    defaultValues: {
      authCookies,
      username: initialCredentials?.username,
      oldPassword: initialCredentials?.password,
    },
  });
  const { errorMessage, setErrorMessage, errorMessageNode } =
    useFormErrorMessage();
  const onSubmit = async (data: ChangePasswordSchema) => {
    if (errorMessage) {
      setErrorMessage(null);
    }
    const response = await changePassword(data);
    if (isActionResponseSuccess(response)) {
      onSuccess();
    } else {
      setErrorMessage(
        response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  return (
    <Form {...form} onSubmit={onSubmit}>
      {errorMessageNode}

      {!initialCredentials && (
        <FormInput
          required
          placeholder="········"
          name="oldPassword"
          label="Old password"
        />
      )}
      <ExtendedFormPasswordInput name="newPassword" label="New password" />
      <FormPasswordInput
        required
        placeholder="········"
        name="confirmPassword"
        label="Confirm password"
      />
      <SubmitButton>Submit</SubmitButton>
    </Form>
  );
}
