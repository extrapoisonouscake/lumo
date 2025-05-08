import { KnownSchools, knownSchoolsIDs } from "@/constants/schools";
import { getMidnight } from "@/helpers/getMidnight";
import { INSTANTIATED_TIMEZONE, timezonedDayJS } from "@/instances/dayjs";
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
export const directURLFunctionsBySchool: Record<
  KnownSchools,
  (date?: Date) => Promise<string>
> = {
  [KnownSchools.MarkIsfeld]: async (date) => {
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
  [KnownSchools.GPVanier]: async (date) => {
    const parsedDate = timezonedDayJS(date);
    let homePageResponse;
    try {
      homePageResponse = await fetch(
        "https://www.comoxvalleyschools.ca/gp-vanier-secondary/"
      );
    } catch {
      throw new Error("Failed to fetch home page");
    }
    const html = await homePageResponse.text();
    const $ = cheerio.load(html);

    const parsedURL = $(
      `h3:has(strong:contains("Daily Announcements:")) + h3 a:contains("Announcements for ${parsedDate.format(
        "MMMM D"
      )}")`
    ).prop("href");
    if (!parsedURL) {
      const directURL = `https://www.comoxvalleyschools.ca/gp-vanier-secondary/wp-content/uploads/sites/29/${parsedDate.year()}/${parsedDate.format(
        "MM"
      )}/Announcements-for-${parsedDate.format("MMMM-D")}.pdf`;
      const response = await fetch(directURL);
      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }
      return directURL;
    }

    return parsedURL;
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
      return;
    }

    const pdfIDHashKey = getAnnouncementsPDFIDRedisHashKey(date);

    const pdfID = await redis.hget(pdfIDHashKey, school);

    let directUrl;
    let needToSetPDFURL = false;
    if (pdfID) {
      directUrl = getUploadthingFileUrl(pdfID as string);
    } else {
      directUrl = await directURLFunctionsBySchool[school](date);

      needToSetPDFURL = true;
    }

    try {
      await parseAnnouncements(directUrl, school, date);
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
    timezone: INSTANTIATED_TIMEZONE,
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
