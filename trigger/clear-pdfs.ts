import { redis } from "@/instances/redis";
import { utapi } from "@/instances/uploadthing";
import { getAnnouncementsPDFIDRedisHashKey } from "@/parsing/announcements/getAnnouncements";

import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const clearPDFsTask = schemaTask({
  id: "clear-pdfs",
  schema: z.object({
    date: z.date(),
  }),
  run: async ({ date }) => {
    const pdfIDHashKey = getAnnouncementsPDFIDRedisHashKey(date);
    const allPDFIDs = await redis.hgetall(pdfIDHashKey);
    if (!allPDFIDs) return;

    await utapi.deleteFiles(Object.values(allPDFIDs) as string[]);
    await redis.del(pdfIDHashKey);
  },
});
