import { redis } from "@/instances/redis";
import { publicProcedure, router } from "@/lib/trpc/base";
import { authenticatedProcedure } from "@/lib/trpc/procedures";
import { Changelog } from "@/types/core";

export const updatesRouter = router({
  getChangelog: authenticatedProcedure.query(async ({ ctx }) => {
    const changelog = (await redis.get("changelog")) as Changelog | null;
    return changelog;
  }),
  getEarliestSupportedVersion: publicProcedure.query(async () => {
    const earliestSupportedVersion = (await redis.get(
      "earliest-supported-version"
    )) as string | null;
    return earliestSupportedVersion;
  }),
});
