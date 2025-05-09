import { INTERNAL_DATE_FORMAT } from "@/constants/core";
import { KnownSchools } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";

import { getMidnight } from "@/helpers/getMidnight";
import { mistral } from "@/instances/mistral";
import { getRedisExpiryArgs, redis } from "@/instances/redis";
import { AnnouncementSectionData } from "@/types/school";
import { FinishReason } from "@mistralai/mistralai/models/components/chatcompletionchoice";
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

const PDF_PARSING_PROMPT =
  `You're an agent that parses PDF files. Parse the provided PDF file and output the response in the JSON format. The response should be an array of objects representing sections of the document. Each section is started by a title (in the PDF this would be a big heading). Each object should contain ONLY the following keys: "type" ("list" if the section is a bullet-point list, or "table" if the section is a table) and "content". If the type is "list", "content" is an array where each item is a bullet point. If the type is "table", "content" is an array where each item is an inner array representing a row in the table. Include the table header as a separate array. DO NOT respond with anything other than the JSON. DO NOT use newlines.` +
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

  if (!elements) {
    console.error("failed to parse pdf", chatResponse);
    return;
  }
  const data = JSON.parse(
    extractBrackets(elements)
  ) as AnnouncementSectionData[];
  if (data.length === 0) throw new Error("Something went wrong");
  const now = timezonedDayJS();
  const midnight = getMidnight(now);

  const expiryArgs = getRedisExpiryArgs(midnight);
  await redis.set(redisKey, elements, ...expiryArgs);
  return data;
}
function extractBrackets(string: string) {
  const start = string.indexOf("[");
  const end = string.lastIndexOf("]");

  if (start === -1 || end === -1 || end < start) {
    return "";
  }

  return string.slice(start, end + 1);
}
