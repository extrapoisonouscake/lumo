import { KnownSchools, knownSchoolsIDs } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import { getUploadthingFileUrl } from "@/instances/uploadthing";
import {
  getAnnouncementsPDFRedisHashKey,
  getAnnouncementsRedisKey,
  parseAnnouncements,
} from "@/parsing/announcements/getAnnouncements";
import { zodEnum } from "@/types/utils";
import {
  AbortTaskRunError,
  runs,
  schedules,
  schemaTask,
} from "@trigger.dev/sdk/v3";
import * as cheerio from "cheerio";
import { z } from "zod";
const fetchFunctionsBySchool: Record<
  KnownSchools,
  (date?: Date) => Promise<ArrayBuffer>
> = {
  [KnownSchools.MarkIsfeld]: async (date) => {
    //TODO Add email files check
    const parsedDate = timezonedDayJS(date);
    let homePageResponse;
    try {
      homePageResponse = await fetch(
        "https://www.comoxvalleyschools.ca/mark-isfeld-secondary"
      );
    } catch {
      throw new Error("Failed to fetch home page");
    }
    const html = await homePageResponse.text();
    const $ = cheerio.load(html);

    const directURL = $(
      `p:has(a:contains("Daily Announcements")) + p a:contains("${parsedDate.format(
        "MMMM D, YYYY"
      )}")`
    ).prop("href");
    if (!directURL) throw new Error("PDF link element not found");

    let response;
    try {
      response = await fetch(directURL);
    } catch {
      throw new Error("Failed to fetch file directly");
    }

    const data = await response.arrayBuffer();
    return data;
  },
};
export const checkSchoolAnnouncementsTask = schemaTask({
  id: "check-school-announcements",
  retry: {
    randomize: false,
    minTimeoutInMs: 20 * 1000,
maxAttempts: 72
  },
  queue: {
    concurrencyLimit: 1,
  },
  schema: z.object({
    school: z.enum(zodEnum(knownSchoolsIDs)),
    date: z.date(),
  }),
  run: async ({ school, date }, { ctx }) => {
    console.log("STATTR", school, date);
    const redisKey = getAnnouncementsRedisKey(school, date);
    console.log({ redisKey });
    const cachedAnnouncements = await redis.get(redisKey);
    if (cachedAnnouncements) {
      return;
    }

    const todayHashKey = getAnnouncementsPDFRedisHashKey(date);
    console.log("ALL", await redis.keys("*"), todayHashKey, school);
    const pdfID = await redis.hget(todayHashKey, school);
    let buffer;
    if (pdfID) {
      buffer = await fetch(getUploadthingFileUrl(pdfID as string)).then(
        (response) => response.arrayBuffer()
      );
    } else {
      const fetchBuffer = fetchFunctionsBySchool[school];
      buffer = await fetchBuffer(date);
    }
    try {
      await parseAnnouncements(buffer, school, date);
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
    await cancelTaskRuns(ctx.task.id, ctx.run.id);
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
      knownSchoolsIDs.map((id) => ({
        payload: { school: id, date: new Date() },
      }))
    );
  },
});

export const cancelTaskRuns = async (taskId: string, excludedRunId: string) => {
  const response = await runs.list({
    taskIdentifier: [taskId],
    status: ["QUEUED", "EXECUTING", "REATTEMPTING", "DELAYED", "FROZEN"],
  });
  for (const run of response.data) {
    if (run.id === excludedRunId) continue;
    await runs.cancel(run.id);
  }
};
