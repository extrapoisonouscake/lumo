import { registrationInternalFields } from "@/lib/auth/public";
import { ParserFunctionArguments } from "./types";

export function parseRegistrationFields({
  responses: [$],
}: ParserFunctionArguments<"registrationFields">) {
  const getSelectOptions = (name: string) =>
    $(`[name=${name}] option`)
      .map((_, el) => $(el).val())
      .toArray();
  const schoolDistrictOptions = getSelectOptions(
    registrationInternalFields.schoolDistrict
  );
  const securityQuestionOptions = getSelectOptions(
    registrationInternalFields.securityQuestionType
  );
  return { schoolDistrictOptions, securityQuestionOptions };
}
