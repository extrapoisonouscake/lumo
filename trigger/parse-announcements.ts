import { KnownSchools, knownSchoolsIDs } from "@/constants/schools";
import { getMidnight } from "@/helpers/getMidnight";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import { getUploadthingFileUrl } from "@/instances/uploadthing";
import {
  getAnnouncementsPDFIDRedisHashKey,
  getAnnouncementsPDFLinkRedisHashKey,
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
const directURLFunctionsBySchool: Record<
  KnownSchools,
  (date?: Date) => Promise<string>
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

    return directURL;
  },
};
const delayMinutes = 20;
const delayMs = delayMinutes * 60 * 1000;
export const checkSchoolAnnouncementsTask = schemaTask({
  id: "check-school-announcements",
  retry: {
    randomize: false,
    minTimeoutInMs: delayMs,
    maxTimeoutInMs: delayMs,
    maxAttempts: Math.round((24 * 60) / delayMinutes),
  },
  queue: {
    concurrencyLimit: 1,
  },
  schema: z.object({
    school: z.enum(zodEnum(knownSchoolsIDs)),
    date: z.date(),
  }),
  run: async ({ school, date }, { ctx }) => {
    const redisKey = getAnnouncementsRedisKey(school, date);
    const cachedAnnouncements = await redis.get(redisKey);
    if (cachedAnnouncements) {
      console.log("Cached announcements found");
      return;
    }

    const pdfIDHashKey = getAnnouncementsPDFIDRedisHashKey(date);
    console.log("pdfIDHashKey", pdfIDHashKey);
    const pdfID = await redis.hget(pdfIDHashKey, school);
    console.log("pdfID", pdfID);
    let directUrl;
    let needToSetPDFURL = false;
    if (pdfID) {
      directUrl = getUploadthingFileUrl(pdfID as string);
    } else {
      directUrl = await directURLFunctionsBySchool[school](date);

      needToSetPDFURL = true;
    }
    const fileResponse = await fetch(directUrl);
    if (!fileResponse.ok) throw new Error("Failed to fetch file");
    const buffer = await fileResponse.arrayBuffer();
    try {
      await parseAnnouncements(buffer, school, date);
    } catch (e) {
      const now = timezonedDayJS();
      if (
        now.day() !== timezonedDayJS(ctx.run.createdAt).day() ||
        now.hour() > 15
      ) {
        throw new AbortTaskRunError("New day");
      } else {
        throw e;
      }
    }
    await Promise.all([
      cancelTaskRuns(ctx.task.id, ctx.run.id),
      needToSetPDFURL && savePDFLink(school, date, directUrl),
    ]);
  },
});
export const savePDFLink = async (
  school: KnownSchools,
  date: Date,
  directUrl: string
) => {
  const pdfLinkHashKey = getAnnouncementsPDFLinkRedisHashKey(date);
  await redis.hset(pdfLinkHashKey, {
    [school]: directUrl,
  });

  await redis.expireat(pdfLinkHashKey, getMidnight(date).unix());
};
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
