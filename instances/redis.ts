import { Redis } from "@upstash/redis";
import { Dayjs } from "dayjs";
import { timezonedDayJS } from "./dayjs";
export const redis = Redis.fromEnv();

export const getRedisExpiryTimestamp = (date: Date | Dayjs) => {
  return timezonedDayJS(date).unix();
};
