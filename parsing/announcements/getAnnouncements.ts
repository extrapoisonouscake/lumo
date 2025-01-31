import { INTERNAL_DATE_FORMAT } from "@/constants/core";
import { KnownSchools } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";

import { unstructuredIO } from "@/instances/unstructured-io";
import { PDFParsingPartitionElement } from "@/instances/unstructured-io/types";

import { getMidnight } from "@/helpers/getMidnight";
import { getRedisExpiryArgs, redis } from "@/instances/redis";
import { Strategy } from "unstructured-client/sdk/models/shared";
import { dailyAnnouncementsFileParser } from "./parsers";
export const withAnnouncementsPrefix = (key: string) => `announcements:${key}`;
export const getAnnouncementsRedisIdentificator = (
  school: KnownSchools,
  date?: Date
) => `${school}:${timezonedDayJS(date).format(INTERNAL_DATE_FORMAT)}`;
export const getAnnouncementsRedisKey = (school: KnownSchools, date?: Date) =>
  withAnnouncementsPrefix(getAnnouncementsRedisIdentificator(school, date));

export const getAnnouncementsPDFIDRedisHashKey = (date: Date) =>
  withAnnouncementsPrefix(
    `pdf-upload-id:${timezonedDayJS(date).format(INTERNAL_DATE_FORMAT)}`
  );
export const getAnnouncementsPDFLinkRedisHashKey = (date: Date) =>
  withAnnouncementsPrefix(
    `pdf-link:${timezonedDayJS(date).format(INTERNAL_DATE_FORMAT)}`
  );
export async function parseAnnouncements(
  buffer: ArrayBuffer,
  school: KnownSchools,
  date?: Date
) {
  const redisKey = getAnnouncementsRedisKey(school, date);

  console.log("usbu", !!buffer);
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
  console.log("usbu2", statusCode, elements, redisKey);

  if (statusCode !== 200 || !elements) {
    console.error("failed to parse pdf", response);
    return;
  }
  const parseElements = dailyAnnouncementsFileParser[school];
  const preparedData =
    parseElements(elements as PDFParsingPartitionElement[]) || [];
  console.log("preparedData", preparedData);
  const now = timezonedDayJS();
  const midnight = getMidnight(now);

  const expiryArgs = getRedisExpiryArgs(midnight);
  await redis.set(redisKey, JSON.stringify(preparedData), ...expiryArgs);
  return preparedData;
}
