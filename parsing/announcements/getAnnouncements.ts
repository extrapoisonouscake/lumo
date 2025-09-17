import { INTERNAL_DATE_FORMAT } from "@/constants/core";
import { KnownSchools } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";

import { mistral } from "@/instances/mistral";
import { redis } from "@/instances/redis";
import { AnnouncementEntry, AnnouncementSectionData } from "@/types/school";
import { FinishReason } from "@mistralai/mistralai/models/components/chatcompletionchoice";
import { logger } from "@trigger.dev/sdk";
export const withAnnouncementsPrefix = (key: string) => `announcements:${key}`;
export const getAnnouncementsRedisSchoolPrefix = (school: KnownSchools) =>
  withAnnouncementsPrefix(school);

export const getAnnouncementsRedisKey = (school: KnownSchools, date?: Date) =>
  `${getAnnouncementsRedisSchoolPrefix(school)}:${timezonedDayJS(date).format(
    INTERNAL_DATE_FORMAT
  )}`;

export const getAnnouncementsPDFIDRedisHashKey = (date: Date) =>
  withAnnouncementsPrefix(
    `pdf-upload-id:${timezonedDayJS(date).format(INTERNAL_DATE_FORMAT)}`
  );
export const getAnnouncementsPDFLinkRedisHashKey = (date: Date) =>
  withAnnouncementsPrefix(
    `pdf-link:${timezonedDayJS(date).format(INTERNAL_DATE_FORMAT)}`
  );

const PDF_PARSING_PROMPT =
  `You're an agent that parses PDF files. Parse the provided PDF file and output the response in the JSON format, but in plain text (without language descriptors such as "json" or "javascript"). The response should be an array of objects representing sections of the document. Each section is started by a title (in the PDF this would be a big heading). Each object should contain ONLY the following keys: "type" ("list" if the section is a bullet-point list, or "table" if the section is a table) and "content". If the type is "list", "content" is an array where each item is a bullet point. If you encounter a nested list, treat it as a single string. If the type is "table", "content" is an array where each item is an inner array representing a row in the table. Include the table header as a separate array. DO NOT respond with anything other than the JSON. DO NOT use newlines.` +
  `Here is an example of the output format:
[
  {
    "type": "list",
    "content": ["Item 1", "Item 2", "Item 3"]
  },
  {
    "type": "table",
    "content": [["Header 1", "Header 2"], ["Row 1, Column 1", "Row 1, Column 2"]]
  }
]`;
type AIOutputItem =
  | { type: "list"; content: string[] }
  | { type: "table"; content: string[][] };
const DOUBLE_QUOTATION_MARK_ELEMENT_ID = "[DQM]";
export async function parseAnnouncements(
  fileUrl: string,
  school: KnownSchools,
  date?: Date
) {
  const redisKey = getAnnouncementsRedisKey(school, date);
  console.log("STARTING PARSING", school, fileUrl);
  const chatResponse = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: PDF_PARSING_PROMPT,
          },
          {
            type: "document_url",
            documentUrl: fileUrl,
          },
        ],
      },
    ],
  });
  console.log("PARSING DONE", school, fileUrl);
  const elements = chatResponse.choices?.find(
    (choice) => choice.finishReason === FinishReason.Stop
  )?.message.content as string | undefined;
  console.log(elements);
  if (!elements) {
    console.error("failed to parse pdf", chatResponse);
    return;
  }
  logger.log("elements", { elements: elements });
  const preparedElements = prepareStringForJSON(elements);
  if (!preparedElements) {
    console.error("failed to prepare elements", elements);
    return;
  }
  const data = JSON.parse(preparedElements) as AIOutputItem[];
  if (data.length === 0) throw new Error("Something went wrong");

  const previousDayDataKey = getAnnouncementsRedisKey(
    school,
    timezonedDayJS(date).subtract(1, "day").toDate()
  );
  const previousDayData = (await redis.get(previousDayDataKey)) as
    | AnnouncementSectionData[]
    | null;

  let preparedData: AnnouncementSectionData[];
  const transformData = ({
    section,
    getIsNew,
  }: {
    section: AIOutputItem;
    getIsNew: (text: string) => AnnouncementEntry["isNew"];
  }): AnnouncementSectionData => {
    if (section.type !== "list") return section;
    return {
      ...section,
      content: section.content.map((entry) => ({
        text: entry,
        isNew: getIsNew(entry),
      })),
    };
  };

  const transformDataWithoutIsNewField = (
    section: AIOutputItem
  ): AnnouncementSectionData =>
    transformData({ section, getIsNew: () => undefined });
  logger.log("previousDayDataKey", { previousDayDataKey, previousDayData });
  if (previousDayData) {
    preparedData = data.map((section, i) => {
      const previousDaySection = previousDayData[i];
      logger.log("section", { section, previousDaySection });
      if (!previousDaySection || previousDaySection.type !== "list") {
        return transformDataWithoutIsNewField(section);
      }
      return transformData({
        section,
        getIsNew: (text) =>
          !previousDaySection.content.some(
            (previousDayEntry) => previousDayEntry.text === text
          ),
      });
    });
  } else {
    preparedData = data.map(transformDataWithoutIsNewField);
  }

  await Promise.all([
    redis.set(redisKey, JSON.stringify(preparedData)),
    previousDayDataKey && redis.del(previousDayDataKey),
  ]);
  return preparedData;
}
function prepareStringForJSON(string: string) {
  const start = string.indexOf("[");
  const end = string.lastIndexOf("]");

  if (start === -1 || end === -1 || end < start) {
    return undefined;
  }
  logger.log("extracting brackets", { string });
  const cleanedString = string
    .slice(start, end + 1)
    .replaceAll("```json", "")
    .replaceAll("```", "");
  return cleanedString.replaceAll('"', DOUBLE_QUOTATION_MARK_ELEMENT_ID);
}
