import { INTERNAL_DATE_FORMAT } from "@/constants/core";
import { KnownSchools } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import { unstructuredIO } from "@/instances/unstructured-io";
import { PDFParsingPartitionElement } from "@/instances/unstructured-io/types";

import * as cheerio from "cheerio";

import { Strategy } from "unstructured-client/sdk/models/shared";
import { dailyAnnouncementsFileParser } from "./parsers";
export const getAnnouncementsRedisKey = (school: KnownSchools, date?: Date) =>
  `announcements:${school}:${timezonedDayJS(date).format(
    INTERNAL_DATE_FORMAT
  )}`;

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
export async function parseAnnouncements(school: KnownSchools, date?: Date) {
  const redisKey = getAnnouncementsRedisKey(school, date);
  const fetchBuffer = fetchFunctionsBySchool[school];
  const buffer = await fetchBuffer(date);
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
  const midnight = now.add(1, "day").startOf("day");
  const secondsTillMidnight = midnight.diff(now, "seconds");
  const redisArgs =
    process.env.NODE_ENV === "development"
      ? ["EX", secondsTillMidnight]
      : [{ ex: secondsTillMidnight }];
  //@ts-expect-error No overload matches this call.
  await redis.set(redisKey, JSON.stringify(preparedData), redisArgs);
  return preparedData;
}
