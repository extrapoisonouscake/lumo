import * as cheerio from "cheerio";

import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";
import { locallyTimezonedDayJS, timezonedDayJS } from "@/instances/dayjs";
import { ScheduleSubject } from "@/types/school";
import { Dayjs } from "dayjs";
import { removeLineBreaks } from "../../helpers/removeLineBreaks";
import { ParserFunctionArguments } from "./types";
function getTableBody($: cheerio.CheerioAPI) {
  const $contentContainer = $(
    ".contentContainer > table:last-of-type > tbody > tr:last-of-type > td"
  );
  if ($contentContainer.length === 0) return null;
  const $tableContainer = $contentContainer.find(".listGridFixed");

  if ($tableContainer.length === 0) {
    const errorMessage = $contentContainer.prop("innerText");
    if (!errorMessage) return null;
    return { knownError: removeLineBreaks(errorMessage) }; //! ?needed?
  }
  const $tableBody = $tableContainer.find("tbody:has(> .listHeader)");

  if ($tableBody.length === 0) return null;
  return $tableBody;
}
function getWeekday($tableBody: ReturnType<cheerio.CheerioAPI>) {
  const rawWeekdayName = $tableBody
    .find(".listHeader th:last-of-type")
    .first()
    .prop("textContent");
  const weekday = removeLineBreaks(rawWeekdayName?.split("-")[0])?.trim();
  return weekday ?? null;
}
export function parseCurrentWeekday({
  responses: [$initial, $dateAdjusted],
}: ParserFunctionArguments<"currentWeekday">) {
  const $ = ($dateAdjusted || $initial)!;

  const $tableBody = getTableBody($);
  if (!$tableBody) return null;
  if ("knownError" in $tableBody) return $tableBody;
  return getWeekday($tableBody);
}
const getDateFromSubjectTimeString = (initialDate: Dayjs) => (time: string) => {
  const t = locallyTimezonedDayJS(time, "HH:mm A");
  return initialDate.set("h", t.get("h")).set("minute", t.get("m")).toDate();
};
export function parseSchedule({
  params: initialParams,
  responses: [$initial, $dateAdjusted],
}: ParserFunctionArguments<"schedule">):
  | { weekday: ReturnType<typeof getWeekday>; subjects: ScheduleSubject[] }
  | { knownError: string } {
  const $ = ($dateAdjusted || $initial)!;
  const $tableBody = getTableBody($);
  if (!$tableBody) throw new Error("No table body");
  if ("knownError" in $tableBody) return $tableBody;

  if ($tableBody.find(".listNoRecordsText").length > 0)
    throw new Error("No records");

  const subjects = $tableBody
    .children("tr")
    .not(".listHeader")
    .toArray()
    .map((row) => {
      const [timeTd, contentTd] = $(row).children("td").toArray();

      const timeString = removeLineBreaks($(timeTd).find("td").text());
      const [startsAt, endsAt] = timeString.split(" - ");
      const getDateFromSubjectTimeStringWithDay = getDateFromSubjectTimeString(
        timezonedDayJS(initialParams.date).startOf("minute")
      );

      const contentCellHTML = $(contentTd).find("td").first().prop("innerHTML");
      if (!contentCellHTML) return;
      const [subjectId, name, teachersString, room] =
        removeLineBreaks(contentCellHTML).split("<br>");
      const subject = {
        startsAt: getDateFromSubjectTimeStringWithDay(startsAt!),
        endsAt: getDateFromSubjectTimeStringWithDay(endsAt!),
        name: prettifyEducationalName(name!),
        actualName: name,
        teachers: teachersString!.split("; "),
        room: room || null,
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
