import { locallyTimezonedDayJS } from "@/instances/dayjs";

export const convertQueryDayToDate = (day?: string) =>
  day
    ? locallyTimezonedDayJS(day, "MM-DD-YYYY").startOf("date").toDate()
    : undefined;
