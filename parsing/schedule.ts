import * as cheerio from "cheerio";

import { prettifySubjectName } from "@/helpers/prettifySubjectName";
import { ScheduleSubject } from "@/types/school";
import { removeLineBreaks } from "../helpers/removeLineBreaks";

export function parseSchedule($: cheerio.CheerioAPI) {
  const $contentContainer = $(
    ".contentContainer > table:last-of-type > tbody > tr:last-of-type > td"
  );

  if ($contentContainer.length === 0) return null;
  const $tableContainer = $contentContainer.find(".listGridFixed");

  if ($tableContainer.length === 0) {
    const errorMessage = $contentContainer.prop("innerText");
    return { knownError: errorMessage ? removeLineBreaks(errorMessage) : null }; //! ?needed?
  }
  const $tableBody = $tableContainer.find("tbody:has(> .listHeader)");

  if ($tableBody.length === 0) return null;
  const rawWeekdayName = $tableBody
    .find(".listHeader th:last-of-type")
    .first()
    .prop("textContent");
  const weekday =
    removeLineBreaks(rawWeekdayName?.split("-")[0])?.trim() ?? null;

  if ($tableBody.find(".listNoRecordsText").length > 0) return [];

  const data = $tableBody
    .children("tr")
    .not(".listHeader")
    .toArray()
    .map((row) => {
      const [timeTd, contentTd] = $(row).children("td").toArray();

      const timeString = removeLineBreaks($(timeTd).find("td").text());
      const [startsAt, endsAt] = timeString.split(" - ");
      let subject: ScheduleSubject = {
        startsAt,
        endsAt,
      };
      const contentCellHTML = $(contentTd).find("td").first().prop("innerHTML");
      if (contentCellHTML) {
        const [subjectId, name, teachersString, room] =
          removeLineBreaks(contentCellHTML).split("<br>");
        subject = {
          ...subject,
          name: prettifySubjectName(name),
          teachers: teachersString.split(";"),
          room: room || null,
        };
      }
      return subject;
    }) satisfies ScheduleSubject[];
  return { weekday, data };
}
