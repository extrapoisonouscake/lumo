import {
  BindArgsValidationErrors,
  SafeActionResult,
  ValidationErrors,
} from "next-safe-action";
import { Schema, ZodObject } from "zod";

export function isSuccessfulActionResponse<
  ServerError,
  S extends ZodObject<any, any, any> | undefined,
  BAS extends readonly Schema[],
  CVE = ValidationErrors<S>,
  CBAVE = BindArgsValidationErrors<BAS>,
  NextCtx = object
>(
  response:
    | SafeActionResult<
        ServerError,
        S,
        BAS,
        CVE,
        CBAVE,
        Record<string, any> & { success: boolean },
        NextCtx
      >
    | undefined
) {
  return !response || response.data?.success;
}
