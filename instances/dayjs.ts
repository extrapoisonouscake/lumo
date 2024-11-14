import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(timezone);
dayjs.extend(utc);
export const INSTANTIATED_TIMEZONE = "America/Vancouver";
dayjs.tz.setDefault(INSTANTIATED_TIMEZONE);
const timezonedDayjs = (...args: any[]) => {
  return dayjs(...args).tz();
};

const timezonedUnix = (value: number) => {
  return dayjs.unix(value).tz();
};

timezonedDayjs.unix = timezonedUnix;

export { dayjs, timezonedDayjs };
