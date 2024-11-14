import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/fetchMyEd";
import SchedulePageSkeleton from "./loading";
import { SchedulePage } from "./schedule-page";

export default async function Page() {
  const data = await fetchMyEd("schedule");
  console.log({ data });
  if (data === sessionExpiredIndicator)
    return <ReloginWrapper skeleton={<SchedulePageSkeleton />} />;
  if (!data) return <ErrorCard />;
  return <SchedulePage data={data} />;
}
