export const loginErrorIDToMessageMap = {
  "account-disabled":
    "Your account has been disabled. Please contact your school administrator for more information.",
  "invalid-auth": "Incorrect username or password.",
  "invalid-parameters": "Invalid parameters.",
  "unexpected-error": "An unexpected error occurred. Try again later.",
};
export type LoginError = keyof typeof loginErrorIDToMessageMap;
export const isKnownLoginError = (error: string): error is LoginError => {
  return Object.keys(loginErrorIDToMessageMap).includes(error as LoginError);
};
