import { ErrorCard } from "@/components/misc/error-card";
import { TitleManager } from "@/components/misc/title-manager";
import { Spinner } from "@/components/ui/button";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
import ip3country from "ip3country";

import { APIProvider } from "@vis.gl/react-google-maps";
import { LoginSuggestionText } from "./login-suggestion-text";
import { RegistrationForm } from "./form";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) throw new Error("No Google Maps API key provided");
export default function SettingsPage() {
  const query = useQuery(
    getTRPCQueryOptions(trpc.myed.auth.getRegistrationFields)()
  );
  return (
    <>
      <TitleManager>Register</TitleManager>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY!}>
        <QueryWrapper
          query={query}
          onError={<RegistrationInitError />}
          skeleton={
            <div className="flex justify-center items-center w-full">
              <Spinner />
            </div>
          }
        >
          {(data) => (
            <RegistrationForm
              passwordRequirements={data.passwordRequirements}
              securityQuestionRequirements={data.securityQuestionRequirements}
              schoolDistricts={data.schoolDistricts}
              defaultCountry={ip3country.lookupStr(data.ip)}
              securityQuestionOptions={data.securityQuestions}
            />
          )}
        </QueryWrapper>
      </APIProvider>
    </>
  );
}
function RegistrationInitError() {
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
