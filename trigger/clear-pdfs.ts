import { redis } from "@/instances/redis";
import { utapi } from "@/instances/uploadthing";
import { getAnnouncementsPDFRedisHashKey } from "@/parsing/announcements/getAnnouncements";

import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const clearPDFsTask = schemaTask({
  id: "clear-pdfs",
  schema: z.object({
    date: z.date(),
  }),
  run: async ({ date }) => {
    const allPDFIDs = await redis.hgetall(
      getAnnouncementsPDFRedisHashKey(date)
    );
    if (!allPDFIDs) return;

    await utapi.deleteFiles(Object.values(allPDFIDs) as string[]);
    await redis.del(getAnnouncementsPDFRedisHashKey(date));
  },
});
