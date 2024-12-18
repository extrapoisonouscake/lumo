import { DATE_FORMAT } from "@/constants/core";
import { KnownSchools } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import { unstructuredIO } from "@/instances/unstructured-io";
import { PDFParsingPartitionElement } from "@/instances/unstructured-io/types";
import { AnnouncementSection } from "@/types/school";
import { waitUntil } from "@vercel/functions";
import { Strategy } from "unstructured-client/sdk/models/shared";
import { dailyAnnouncementsFileParser } from "./parsers";
export const getAnnouncementsRedisKey = (school: KnownSchools, date?: Date) =>
  `announcements:${school}:${timezonedDayJS(date).format(DATE_FORMAT)}`;
export async function getAnnouncements(school: KnownSchools, date?: Date) {
  const redisKey = getAnnouncementsRedisKey(school, date);
  const cachedData = await redis.get(redisKey);
  if (cachedData) {
    const parsedData = JSON.parse(cachedData as string);
    return parsedData as AnnouncementSection[];
  }
  const fetchBuffer = fetchFunctionsBySchool[school];
  let buffer;
  try {
    buffer = await fetchBuffer(date);
  } catch (e) {
    console.log(e);
    return [];
  }
  const result = await parseAndCacheAnnouncements(buffer, school, redisKey);
  return result;
}
const fetchFunctionsBySchool: Record<
  KnownSchools,
  (date?: Date) => Promise<ArrayBuffer>
> = {
  [KnownSchools.MarkIsfeld]: async (date) => {
    //TODO Add email files check
    const parsedDate = timezonedDayJS(date);
    const year = parsedDate.year();
    const directURL = `https://www.comoxvalleyschools.ca/mark-isfeld-secondary/wp-content/uploads/sites/44/${year}/${
      parsedDate.month() + 1
    }/DA-${parsedDate.format("MMM")}-${parsedDate.date()}-${year}.pdf`;
    const response = await fetch(directURL);
    if (!response.ok) {
      throw new Error("Failed to fetch file directly");
    }

    const data = await response.arrayBuffer();
    return data;
  },
};
export async function parseAndCacheAnnouncements(
  buffer: ArrayBuffer,
  school: KnownSchools,
  redisKey: string
) {
  let preparedData: AnnouncementSection[];
  try {
    const response = await unstructuredIO.general.partition({
      partitionParameters: {
        files: {
          content: buffer,
          fileName: `${redisKey}.pdf`,
        },
        strategy: Strategy.HiRes,
        pdfInferTableStructure: true,
        splitPdfPage: true,
        splitPdfAllowFailed: true,
        splitPdfConcurrencyLevel: 15,
        languages: ["eng"],
      },
    });
    const { statusCode, elements } = response;
    if (statusCode !== 200 || !elements) throw new Error("Failed to parse PDF");
    const parseElements = dailyAnnouncementsFileParser[school];
    preparedData =
      parseElements(elements as PDFParsingPartitionElement[]) || [];
  } catch {
    preparedData = [];
  }
  const now = timezonedDayJS();
  const midnight = now.add(1, "day").startOf("day");
  const secondsTillMidnight = midnight.diff(now, "seconds");
  const redisArgs =
    process.env.NODE_ENV === "development"
      ? ["EX", secondsTillMidnight]
      : [{ ex: secondsTillMidnight }];
  //@ts-expect-error No overload matches this call.
  waitUntil(redis.set(redisKey, JSON.stringify(preparedData), redisArgs));
  return preparedData;
}
