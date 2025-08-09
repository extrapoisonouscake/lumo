import { locallyTimezonedDayJS, timezonedDayJS } from "@/instances/dayjs";
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
export function parseCurrentWeekday({
  responses,
}: ParserFunctionArguments<"currentWeekday">) {
  const $ = responses.at(-1)!;

  const $tableBody = $getGenericContentTableBody($);
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
  responses,
}: ParserFunctionArguments<"schedule">):
  | { weekday: ReturnType<typeof getWeekday>; subjects: ScheduleSubject[] }
  | { knownError: string } {
  // const $ = responses.at(-1)!;
  // const $tableBody = $getGenericContentTableBody($);
  // if (!$tableBody) throw new Error("No table body");
  // if ("knownError" in $tableBody) return $tableBody;

  // if ($tableBody.find(".listNoRecordsText").length > 0)
  //   throw new Error("No records");

  // const subjects = $tableBody
  //   .children("tr")
  //   .not(MYED_TABLE_HEADER_SELECTOR)
  //   .toArray()
  //   .map((row) => {
  //     const [timeTd, contentTd] = $(row).children("td").toArray();

  //     const timeString = removeLineBreaks($(timeTd).find("td").text());
  //     const [startsAt, endsAt] = timeString.split(" - ");
  //     const getDateFromSubjectTimeStringWithDay = getDateFromSubjectTimeString(
  //       timezonedDayJS(initialParams.date).startOf("minute")
  //     );

  //     const contentCellHTML = $(contentTd).find("td").first().prop("innerHTML");
  //     if (!contentCellHTML) return;
  //     const [subjectId, name, teachersString, room] =
  //       removeLineBreaks(contentCellHTML).split("<br>");
  //     const subject = {
  //       startsAt: getDateFromSubjectTimeStringWithDay(startsAt!),
  //       endsAt: getDateFromSubjectTimeStringWithDay(endsAt!),
  //       name: prettifyEducationalName(name!),
  //       actualName: name,
  //       teachers: teachersString!.split("; "),
  //       room: room || null,
  //     };
  //     if (!subject.name) return;
  //     return subject;
  //   })
  //   .filter(Boolean) as ScheduleSubject[] satisfies (
  //   | ScheduleSubject
  //   | undefined
  // )[];

  // const weekday = getWeekday($tableBody);
  // console.log(JSON.stringify({ weekday, subjects }, null, 2));
  const curDate = timezonedDayJS();
  return {
    weekday: "Tuesday",
    subjects: [
      {
        startsAt: curDate.toDate(),
        endsAt: curDate.add(10, "seconds").toDate(),
        name: "Chemistry 11",
        actualName: "CHEMISTRY 11",
        teachers: ["McKillican, Debra"],
        room: "105",
      },
      {
        startsAt: curDate.add(20, "seconds").toDate(),
        endsAt: curDate.add(30, "seconds").toDate(),
        name: "TA",
        actualName: "TEACHER ADVISORY",
        teachers: ["Storey, Aarlen"],
        room: "406",
      },
      {
        startsAt: curDate.add(40, "seconds").toDate(),
        endsAt: curDate.add(50, "seconds").toDate(),
        name: "Social Justice 12",
        actualName: "SOCIAL JUSTICE 12",
        teachers: ["Beckett, Heather"],
        room: "201",
      },
      {
        startsAt: curDate.add(60, "seconds").toDate(),
        endsAt: curDate.add(70, "seconds").toDate(),
        name: "Integrated Learning Centre 11",
        actualName: "INTEGRATED LEARNING CENTRE 11",
        teachers: ["Watt, Christi"],
        room: "400",
      },
      {
        startsAt: curDate.add(80, "seconds").toDate(),
        endsAt: curDate.add(90, "seconds").toDate(),
        name: "Physics 11",
        actualName: "PHYSICS 11",
        teachers: ["Pendak, Jesse"],
        room: "305",
      },
    ],
  };
}
