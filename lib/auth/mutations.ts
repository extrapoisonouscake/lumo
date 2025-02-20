"use server";
import { fetchMyEd } from "@/instances/fetchMyEd";
import { redirect } from "next/navigation";
import { actionClient } from "../safe-action";
import { deleteSessionAndLogOut, performLogin } from "./helpers";
import {
  isKnownLoginError,
  LoginError,
  loginSchema,
  registerSchema,
} from "./public";
const redirectToLoginWithError = (error: string) => {
  redirect(`/login?error=${error}`);
};
export const login = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    try {
      await performLogin(parsedInput);
    } catch (e: any) {
      const { message } = e;
      const safeErrorMessage: LoginError = isKnownLoginError(message)
        ? message
        : "unexpected-error";
      redirectToLoginWithError(safeErrorMessage);
    }
    redirect("/");
  });

export const logOut = actionClient.action(async () => {
  await deleteSessionAndLogOut();
});
export const register = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    const { type, fields } = parsedInput;
    const query = new URLSearchParams({
      userEvent: "90160",
      deploymentId: "aspen",
    });
    const response = await fetchMyEd("accountCreation.do", {
      method: "POST",
    });

    // var choice = $('#step1 input[name\x3d"type"]:checked').val();
    // var url = "accountCreation.do" + "?userEvent\x3d" + encodeURIComponent(eventSubmit) + "\x26deploymentId\x3d" + encodeURIComponent($("#deploymentId").val()) + "\x26" + encodeURIComponent(paramAccountType) + "\x3d" + encodeURIComponent(choice) + "\x26" + encodeURIComponent(paramValidation) + "\x3d" + encodeURIComponent(getValidationMap()) + "\x26" + encodeURIComponent(paramGeneral) + "\x3d" + encodeURIComponent(getGeneralMap()) + "\x26" + encodeURIComponent(paramUserInfo) +
    // "\x3d" + encodeURIComponent(getUserMap());
    // makeAsynchronousXmlRequest(url, "ajaxStep4CreateAccount", "ajaxStep4CreateAccountError()")
    redirect("/login");
  });
