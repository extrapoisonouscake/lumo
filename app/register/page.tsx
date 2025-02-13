import ip3country from "ip3country";
import { headers } from "next/headers";
import { RegistrationForm } from "./form";
ip3country.init();
export default function Page() {
  const ip = (headers().get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
  const countryCode = ip3country.lookupStr(ip);
  return <RegistrationForm defaultCountry={countryCode} />;
}
