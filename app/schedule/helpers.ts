import dayjs from "dayjs";

export const convertQueryDayToDate = (day?: string) =>
  day ? dayjs(day, "MM-DD-YYYY").toDate() : undefined;
