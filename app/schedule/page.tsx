import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/fetchMyEd";

export default async function Page() {
  const data = await fetchMyEd("schedule");
  if (data === sessionExpiredIndicator)
    return <ReloginWrapper skeleton={<p>ss</p>} />;
  if (!data) return <ErrorCard />;
  return <p>{JSON.stringify(data)}</p>;
}
