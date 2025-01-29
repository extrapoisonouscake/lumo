import { knownSchoolsIDs } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import {
  getAnnouncementsRedisKey,
  parseAnnouncements,
} from "@/parsing/announcements/getAnnouncements";
import { zodEnum } from "@/types/utils";
import { AbortTaskRunError, schedules, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const checkSchoolAnnouncementsTask = schemaTask({
  id: "check-school-announcements",
  retry: {
    randomize: false,
    minTimeoutInMs: 20 * 1000,
  },
  schema: z.object({
    school: z.enum(zodEnum(knownSchoolsIDs)),
    date: z.date().optional(),
  }),
  run: async ({ school, date }, { ctx }) => {
    const redisKey = getAnnouncementsRedisKey(school, date);
    const cachedAnnouncements = await redis.get(redisKey);
    if (cachedAnnouncements) {
      console.log("Using cached announcements");
      return;
    }
    try {
      await parseAnnouncements(school, date);
    } catch (e) {
      const now = timezonedDayJS();
      if (
        now.day() !== timezonedDayJS(ctx.run.createdAt).day() ||
        now.hour() > 15
      ) {
        console.log("ABORTING");
        throw new AbortTaskRunError("New day");
      } else {
        throw e;
      }
    }
  },
});
export const checkAllAnnouncementsTask = schedules.task({
  id: "check-for-all-announcements",

  cron: {
    timezone: "America/Vancouver",
    pattern: "0 9 * 1-6,9-12 1-5",
  },
  run: async () => {
    await checkSchoolAnnouncementsTask.batchTrigger(
      knownSchoolsIDs.map((id) => ({ payload: { school: id } }))
    );
  },
});
