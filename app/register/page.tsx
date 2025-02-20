import { ErrorCard } from "@/components/misc/error-card";
import { getMyEd } from "@/parsing/myed/getMyEd";
import ip3country from "ip3country";
import { headers } from "next/headers";
import { RegistrationForm } from "./form";
import { LoginSuggestionText } from "./login-suggestion-text";
ip3country.init();
export default async function Page() {
  const data = await getMyEd("registrationFields");
  if (data) {
    const ip = (headers().get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
    const countryCode = ip3country.lookupStr(ip);
    return (
      <RegistrationForm
        schoolDistricts={data.schoolDistrictOptions}
        defaultCountry={countryCode}
        securityQuestionOptions={data.securityQuestionOptions}
      />
    );
  } else {
    return (
      <div className="flex flex-col gap-3">
        <ErrorCard>
          Registration is temporarily unavailable. Visit{" "}
          <a
            href="https://myeducation.gov.bc.ca/aspen/accountCreation.do"
            target="_blank"
            className="text-blue-500 underline"
          >
            MyEdBC
          </a>{" "}
          to continue.
        </ErrorCard>
        <LoginSuggestionText />
      </div>
    );
  }
}
