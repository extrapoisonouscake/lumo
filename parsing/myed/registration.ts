import { registrationInternalFields } from "@/lib/auth/public";
import { ParserFunctionArguments } from "./types";

export function parseRegistrationFields({
  responses: [$],
}: ParserFunctionArguments<"registrationFields">) {
  const schoolDistrictOptions = $(
    `[name=${registrationInternalFields.schoolDistrict}] option`
  )
    .map((_, el) => $(el).val())
    .toArray();
  return { schoolDistrictOptions };
}
