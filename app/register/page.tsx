import { ErrorCard } from "@/components/misc/error-card";
import { getMyEd } from "@/parsing/myed/getMyEd";
import ip3country from "ip3country";
import { headers } from "next/headers";
import Link from "next/link";
import { RegistrationForm } from "./form";
ip3country.init();
export default async function Page() {
  let content;
  const data = await getMyEd("registrationFields");
  if (data) {
    const ip = (headers().get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
    const countryCode = ip3country.lookupStr(ip);
    content = (
      <RegistrationForm
        schoolDistricts={data.schoolDistrictOptions}
        defaultCountry={countryCode}
      />
    );
  } else {
    content = (
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
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {content}
      <Link
        href="/login"
        className="text-center text-sm text-secondary-foreground"
      >
        Already have an account?
      </Link>
    </div>
  );
}
