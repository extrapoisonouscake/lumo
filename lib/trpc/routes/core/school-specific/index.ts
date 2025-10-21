import { isKnownSchool } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import {
  getAnnouncementsPDFLinkRedisHashKey,
  getAnnouncementsRedisKey,
} from "@/parsing/announcements/getAnnouncements";
import { dailyAnnouncementsRichTitlesData } from "@/parsing/announcements/parsers";
import { AnnouncementSection, AnnouncementSectionData } from "@/types/school";
import { TRPCError } from "@trpc/server";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";
import { getUserSettings } from "../settings";
export const schoolSpecificRouter = router({
  getAnnouncements: authenticatedProcedure.query(async ({ ctx }) => {
    const date = timezonedDayJS();

    let pdfLink;
    const { schoolId } = await getUserSettings(ctx);

    if (!schoolId || !isKnownSchool(schoolId) || [0, 6].includes(date.day())) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Announcements not available",
      });
    }
    const redisKey = getAnnouncementsRedisKey(schoolId);
    const pdfLinkHashKey = getAnnouncementsPDFLinkRedisHashKey(new Date());
    let data: AnnouncementSection[] = [];
    let cachedData;
    [cachedData, pdfLink] = await Promise.all([
      redis.get(redisKey),

      redis.hget(pdfLinkHashKey, schoolId) as Promise<string | null>,
    ]);
    if (cachedData) {
      const richData = dailyAnnouncementsRichTitlesData[schoolId];
      const parsedData = cachedData as AnnouncementSectionData[];
      data = parsedData.map((item, i) => ({
        ...item,
        ...richData[i]!,
      }));
    }
    if (data.length === 0) {
      return {
        sections: [],
        pdfLink: null,
      };
    }
    return {
      sections: data,
      pdfLink,
    };
  }),
});
