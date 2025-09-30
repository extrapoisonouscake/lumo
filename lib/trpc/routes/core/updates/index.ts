import { redis } from "@/instances/redis";
import { router } from "@/lib/trpc/base";
import { authenticatedProcedure } from "@/lib/trpc/procedures";
import { Changelog } from "@/types/core";

export const updatesRouter = router({
  getChangelog: authenticatedProcedure.query(async ({ ctx }) => {
    const changelog = (await redis.get("changelog")) as Changelog | null;
    return changelog;
  }),
});
