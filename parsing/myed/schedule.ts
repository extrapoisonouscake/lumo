import { decodeHtmlEntities } from "@/helpers/decodeHtmlEntities";
import { getSubjectEmoji } from "@/helpers/getSubjectEmoji";
import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";
import { locallyTimezonedDayJS } from "@/instances/dayjs";
import { ScheduleSubject } from "@/types/school";
import * as cheerio from "cheerio";
import { Dayjs } from "dayjs";
import { removeLineBreaks } from "../../helpers/removeLineBreaks";
import {
  $getGenericContentTableBody,
  MYED_TABLE_HEADER_SELECTOR,
} from "./helpers";
import { ParserFunctionArguments } from "./types";

function getWeekday($tableBody: ReturnType<cheerio.CheerioAPI>) {
  const rawWeekdayName = $tableBody
    .find(`${MYED_TABLE_HEADER_SELECTOR} th:last-of-type`)
    .first()
    .prop("textContent");
  const weekday = removeLineBreaks(rawWeekdayName?.split("-")[0])?.trim();
  return weekday ?? null;
}
const getDateFromSubjectTimeString = (initialDate: Dayjs) => (time: string) => {
  const t = locallyTimezonedDayJS(time, "HH:mm A");
  return initialDate.set("h", t.get("h")).set("minute", t.get("m")).toDate();
};
export function parseSchedule({
  params: initialParams,
  responses,
}: ParserFunctionArguments<"schedule">):
  | { weekday: ReturnType<typeof getWeekday>; subjects: ScheduleSubject[] }
  | { knownError: string } {
  const $ = responses.at(-1)!;
  const $tableBody = $getGenericContentTableBody($);
  if (!$tableBody) throw new Error("No table body");
  if ("knownError" in $tableBody) return $tableBody;

  if ($tableBody.find(".listNoRecordsText").length > 0)
    throw new Error("No records");

  const subjects = $tableBody
    .children("tr")
    .not(MYED_TABLE_HEADER_SELECTOR)
    .toArray()
    .map((row) => {
      const [timeTd, contentTd] = $(row).children("td").toArray();

      const timeString = removeLineBreaks($(timeTd).find("td").text());
      const [startsAt, endsAt] = timeString.split(" - ");
      const getDateFromSubjectTimeStringWithDay = getDateFromSubjectTimeString(
        locallyTimezonedDayJS(initialParams.day).startOf("minute")
      );

      const contentCellHTML = $(contentTd).find("td").first().prop("innerHTML");
      if (!contentCellHTML) return;
      const [subjectId, name, teachersString, room] =
        removeLineBreaks(contentCellHTML).split("<br>");

      // Decode HTML entities in the name (e.g., &amp; becomes &)
      const decodedName = name ? decodeHtmlEntities(name) : name;
      const subject = {
        startsAt: getDateFromSubjectTimeStringWithDay(startsAt!),
        endsAt: getDateFromSubjectTimeStringWithDay(endsAt!),
        name: {
          prettified: prettifyEducationalName(decodedName!),
          actual: decodedName,
          emoji: getSubjectEmoji(decodedName!),
        },
        teachers: teachersString!.split("; "),
        room: room ? prettifyEducationalName(room) : null,
      };
      if (!subject.name) return;
      return subject;
    })
    .filter(Boolean) as ScheduleSubject[] satisfies (
    | ScheduleSubject
    | undefined
  )[];

  const weekday = getWeekday($tableBody);

  return { weekday, subjects };
}
