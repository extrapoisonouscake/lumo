import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { locallyTimezonedDayJS, timezonedDayJS } from "@/instances/dayjs";
import { SCHEDULE_QUERY_DATE_FORMAT } from "./constants";
import { SchedulePageContent } from "./content";
interface Props {
  params: Promise<{ slug?: [string?] }>;
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const day = slug?.[0];
  let dateObject;
  if (day) {
    dateObject = locallyTimezonedDayJS(day, SCHEDULE_QUERY_DATE_FORMAT);
  } else {
    dateObject = timezonedDayJS();
  }
  return { title: `${dateObject.format("MMM D, YYYY")} - Schedule` };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const day = slug?.[0];
  return (
    <PageDataProvider>
      <div className="flex flex-col gap-4">
        <PageHeading />
        <SchedulePageContent initialDay={day} />
      </div>
    </PageDataProvider>
  );
}
