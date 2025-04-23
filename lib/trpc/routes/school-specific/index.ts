import { isKnownSchool } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import {
  getAnnouncementsPDFLinkRedisHashKey,
  getAnnouncementsRedisKey,
} from "@/parsing/announcements/getAnnouncements";
import { AnnouncementSection } from "@/types/school";
import { TRPCError } from "@trpc/server";
import { router } from "../../base";
import { atLeastGuestProcedure } from "../../procedures";
import { getUserSettings } from "../user/queries";
import { AnnouncementsNotAvailableReason } from "./public";

export const schoolSpecificRouter = router({
  getAnnouncements: atLeastGuestProcedure.query(async () => {
    const date = timezonedDayJS();

    let pdfLink;
    const { schoolId } = await getUserSettings();
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
      const parsedData =
        process.env.NODE_ENV === "development"
          ? JSON.parse(cachedData as string)
          : cachedData;
      data = parsedData;
    }
    if (data.length === 0) {
      return {
        notAvailableReason: AnnouncementsNotAvailableReason.NoAnnouncements,
      };
    }
    return {
      data,
      pdfLink,
    };
  }),
});
