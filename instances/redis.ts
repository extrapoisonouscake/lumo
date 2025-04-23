import { Redis } from "@upstash/redis";
import { Dayjs } from "dayjs";
import { timezonedDayJS } from "./dayjs";
export const redis = Redis.fromEnv();
export const getRedisExpiryArgs = (date: Date | Dayjs) => {
  const unixTime = timezonedDayJS(date).unix();
  const redisArgs =
    process.env.NODE_ENV === "development"
      ? ["EXAT", unixTime]
      : [{ exat: unixTime }];
  return redisArgs as any;
};
