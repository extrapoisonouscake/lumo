import { INSTANTIATED_TIMEZONE } from "@/instances/dayjs";
import dayjs from "dayjs";

export const convertQueryDayToDate = (day?: string) =>
  day
    ? dayjs(day, "MM-DD-YYYY")
        .tz(INSTANTIATED_TIMEZONE, true)
        .startOf("date")
        .toDate()
    : undefined;
