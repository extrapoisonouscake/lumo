import { locallyTimezonedDayJS } from "@/instances/dayjs";
import { SCHEDULE_QUERY_DATE_FORMAT } from "./constants";
export const convertQueryDayToDate = (day?: string) =>
  (day
    ? locallyTimezonedDayJS(day, SCHEDULE_QUERY_DATE_FORMAT)
    : locallyTimezonedDayJS()
  )
    .startOf("day")
    .toDate();
