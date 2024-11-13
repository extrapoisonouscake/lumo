import * as cheerio from "cheerio";

import { ScheduleSubject } from "@/types/school";
import { removeLineBreaks } from "../helpers/removeLineBreaks";

export function parseSchedule($: cheerio.CheerioAPI) {
  const $rootContainer = $(".contentContainer");

  if (!$rootContainer) return null;
  const $tableSecondLevelContainer = $rootContainer
    .last()
    .first()
    .last()
    .first();

  if (!$tableSecondLevelContainer) return null;
  const $tableContainer = $tableSecondLevelContainer.find(".listGridFixed");

  if (!$tableContainer) {
    const errorMessage = $tableSecondLevelContainer.prop("innerText");
    return { knownError: errorMessage ? removeLineBreaks(errorMessage) : null }; //! ?needed?
  }
  const $tableBody = $tableContainer.find("tbody:has(> .listHeader)").first();

  if (!$tableBody) return null;
  const weekdayName =
    $tableBody
      .filter(".listHeader")
      .find("th:last-of-type")
      .first()
      .prop("textContent") ?? null;

  if ($tableBody.has(".listNoRecordsText").length > 0) return [];

  const data = $tableBody
    .children("tr")
    .not(".listHeader")
    .toArray()
    .map((row) => {
      const [timeTd, contentTd] = $(row).children("td").toArray();
      // $(timeTd).
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
          name,
          teachers: teachersString.split(";"),
          room,
        };
      }
      return subject;
    }) satisfies ScheduleSubject[];
  return { weekdayName, data };
}
