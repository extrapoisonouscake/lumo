import { ErrorCard } from "@/components/misc/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MYED_DATE_FORMAT } from "@/constants/myed";
import { locallyTimezonedDayJS, timezonedDayJS } from "@/instances/dayjs";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import { MyEdEndpointsParams } from "@/types/myed";
import { ComponentProps } from "react";
import { ScheduleTable } from "./table";
import { Dayjs } from "dayjs";
import { SCHEDULE_QUERY_DATE_FORMAT } from "../constants";
const getWinterBreakDates = (date:Dayjs) =>{
  const month=date.month()
  const currentYear=date.year()
  let year
  if(month === 0){
year=currentYear-1
  }else{
    year=currentYear
  }
  const december31 = timezonedDayJS(`${year}-12-31`);
  const lastMonday = december31.day(1);
  
  const secondToLastMonday = lastMonday.subtract(1, 'week');
  const january1 = timezonedDayJS(`${year + 1}-01-01`);
  const firstFriday = january1.day(5);
  return [secondToLastMonday,firstFriday] as const;
  }
const getSpringBreakDates = (year:number)=>{
  const march31 = timezonedDayJS(`${year}-03-31`);
  
  const lastMonday = march31.day(1);
  
  const thirdToLastMonday = lastMonday.subtract(2, 'week');
  const april1 = timezonedDayJS(`${year}-04-01`);
  const firstFriday = april1.day(5);
  const secondFriday = firstFriday.add(1,'week')
  return [thirdToLastMonday,secondFriday] as const
}
const isDayjsObjectBetweenDates=(dateObject:Dayjs,date1:Dayjs,date2:Dayjs)=>dateObject.isBetween(date1, date2, "date", "[]")
const visualizableErrors: Record<
  string,
  ({ day }: { day: string | undefined }) => {message:string, emoji:string}
> = {
  "School is not in session on that date.": ({ day }) => {
    const dateObject = locallyTimezonedDayJS(day);
    let message,
      emoji = "😴";
    const winterBreakDates = getWinterBreakDates(dateObject);
    const springBreakDates = getSpringBreakDates(dateObject.year());
    if (
      isDayjsObjectBetweenDates(dateObject,...winterBreakDates)
    ) {
      message = "Happy Holidays!";
      emoji = "❄️";
    } else if(isDayjsObjectBetweenDates(dateObject,...springBreakDates)){
      message = "It's Spring Break.";
      emoji = "🌷";
    } else {
      let messagePortion
      if (timezonedDayJS().isSame(dateObject, "date")) {
        messagePortion = "today";
      } else {
        messagePortion = "on this day";
      }
      
      message = `No school ${messagePortion}.`;
    }
    return {message, emoji};
  },
};
export async function ScheduleContent({ day }: { day: string | undefined }) {
  const params: MyEdEndpointsParams<"schedule"> = {};
  if (day) {
    params.day = locallyTimezonedDayJS(day, SCHEDULE_QUERY_DATE_FORMAT).format(
      MYED_DATE_FORMAT
    );
  }
  const data = await fetchMyEd("schedule", params);

  const hasKnownError = data && "knownError" in data;
  if (!data || hasKnownError) {
    let errorCardProps: ComponentProps<typeof ErrorCard> = {
    };
    if (hasKnownError) {
      const visualData = visualizableErrors[data.knownError]?.({ day });
      if (visualData) {
        errorCardProps= visualData;
      }
    }
    return <ErrorCard {...errorCardProps} />;
  }

  return (
    <>
      {
        (day ? locallyTimezonedDayJS(day) : timezonedDayJS()).day() === 5 && (
          <h3>
            Same as: <span className="font-semibold">{data.weekday}</span>
          </h3>
        )}
      <ScheduleTable data={data.subjects} />
    </>
  );
}
export function ScheduleContentSkeleton({
  day,
}: ComponentProps<typeof ScheduleContent>) {
  return (
    <>
      {(day ? locallyTimezonedDayJS(day) : timezonedDayJS()).day() === 5 && (
        <div className="flex items-center gap-2">
          <h3>Same as:</h3>
          <Skeleton>
            <span className="font-semibold">Friday</span>
          </Skeleton>
        </div>
      )}

      <ScheduleTable isLoading />
    </>
  );
}
