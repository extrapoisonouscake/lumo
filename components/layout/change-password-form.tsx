import { AuthCookies } from "@/helpers/getAuthCookies";
import { LoginSchema } from "@/lib/trpc/routes/myed/auth/public";
export function ChangePasswordForm({
  onSuccess,
  authCookies,
  getInitialCredentials,
}: {
  onSuccess: () => void;
  authCookies?: AuthCookies;
  getInitialCredentials?: () => LoginSchema;
}) {
  // const initialCredentials = getInitialCredentials?.();
  // const form = useFormValidation(changePasswordSchema, {
  //   defaultValues: {
  //     authCookies,
  //     username: initialCredentials?.username,
  //     oldPassword: initialCredentials?.password,
  //   },
  // });
  // const { errorMessage, setErrorMessage, errorMessageNode } =
  //   useFormErrorMessage();
  // const changePasswordMutation = useMutation(
  //   trpc.myed.auth.changePassword.mutationOptions()
  // );
  // const onSubmit = async (data: ChangePasswordSchema) => {
  //   if (errorMessage) {
  //     setErrorMessage(null);
  //   }
  //   try {
  //     const response = await changePasswordMutation.mutateAsync(data);
  //     onSuccess();
  //   } catch (e) {
  //     if (isTRPCError(e)) {
  //       setErrorMessage(e.message);
  //     } else {
  //       setErrorMessage("An unexpected error occurred.");
  //     }
  //   }
  // };

  return (
    <>
      {/* <Form {...form} onSubmit={onSubmit}>
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
      </Form> */}
    </>
  );
}
