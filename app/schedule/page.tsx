import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { timezonedDayjs } from "@/instances/dayjs";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/fetchMyEd";
import SchedulePageSkeleton from "./loading";
import { SchedulePage } from "./schedule-page";

export default async function Page({
  searchParams,
}: {
  searchParams: { day?: string };
}) {
  const params: { day?: string } = {};
  if (searchParams.day) {
    params.day = timezonedDayjs(searchParams.day, "MM-DD-YYYY").format(
      "DD/MM/YYYY"
    );
  }
  const data = await fetchMyEd("schedule", params);
  if (data === sessionExpiredIndicator)
    return <ReloginWrapper skeleton={<SchedulePageSkeleton />} />;
  if (!data) return <ErrorCard />;
  return <SchedulePage data={data} day={searchParams.day} />;
}
