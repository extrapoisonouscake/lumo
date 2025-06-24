"use client";
import { ErrorCard } from "@/components/misc/error-card";
import { Spinner } from "@/components/ui/button";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { useQuery } from "@tanstack/react-query";
import ip3country from "ip3country";
import { trpc } from "../trpc";
import { RegistrationForm } from "./form";
import { LoginSuggestionText } from "./login-suggestion-text";
ip3country.init();
export function SettingsPageContent() {
  const query = useQuery(trpc.myed.auth.getRegistrationFields.queryOptions());
  return (
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
          schoolDistricts={data.schoolDistrictOptions}
          defaultCountry={ip3country.lookupStr(data.ip)}
          securityQuestionOptions={data.securityQuestionOptions}
        />
      )}
    </QueryWrapper>
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
