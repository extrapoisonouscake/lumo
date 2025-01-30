import { Redis } from "@upstash/redis";
import LocalRedis from "ioredis";
export const redis =
  process.env.NODE_ENV === "development" ? new LocalRedis() : Redis.fromEnv();
export const getRedisExpiryArgs = (seconds: number) => {
  const redisArgs =
    process.env.NODE_ENV === "development"
      ? ["EX", seconds]
      : [{ ex: seconds }];
  return redisArgs as any;
};
