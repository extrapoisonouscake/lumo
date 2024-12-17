import { Redis } from "@upstash/redis";
import LocalRedis from "ioredis";
export const redis =
  process.env.NODE_ENV === "development" ? new LocalRedis() : Redis.fromEnv();
