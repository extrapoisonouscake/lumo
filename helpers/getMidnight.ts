import { timezonedDayJS } from "@/instances/dayjs";
import { Dayjs } from "dayjs";

export const getMidnight = (date: Date | Dayjs) =>
  timezonedDayJS(date).add(1, "day").startOf("day");
