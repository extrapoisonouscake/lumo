import { Redis } from "@upstash/redis";
import { Dayjs } from "dayjs";
import LocalRedis from "ioredis";
import { timezonedDayJS } from "./dayjs";
export const redis =
  process.env.NODE_ENV === "development"
    ? new LocalRedis({ lazyConnect: true })
    : Redis.fromEnv();
export const getRedisExpiryArgs = (date: Date | Dayjs) => {
  const unixTime = timezonedDayJS(date).unix();
  const redisArgs =
    process.env.NODE_ENV === "development"
      ? ["EXAT", unixTime]
      : [{ exat: unixTime }];
  return redisArgs as any;
};
