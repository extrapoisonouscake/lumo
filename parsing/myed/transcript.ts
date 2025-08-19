import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";
import {
  CourseRequirement,
  CreditSummaryEntry,
  TranscriptEntry,
} from "@/types/school";
import * as cheerio from "cheerio";
import { $getGenericContentTableBody, $getTableValues } from "./helpers";
import { ParserFunctionArguments } from "./types";

export function parseTranscriptEntries({
  responses,
}: ParserFunctionArguments<"transcriptEntries">): TranscriptEntry[] {
  const $ = responses.at(-1)!;
  const $tableBody = $getGenericContentTableBody($);
  if (!$tableBody) throw new Error("No table body");
  if ("knownError" in $tableBody) throw new Error($tableBody.knownError);
  const values = $getTableValues($tableBody);
  const transcript = values.map((row) => {
    const [year, grade, subject, finalGrade, credit] = row;
    return {
      year: +year!,
      grade: grade!,
      subjectName: prettifyEducationalName(subject!),
      finalGrade: finalGrade ? +finalGrade : null,
      creditAmount: +credit!,
    };
  });
  return transcript;
}

export function parseCreditSummary({
  responses,
}: ParserFunctionArguments<"creditSummary">): CreditSummaryEntry[] {
  const $ = responses.at(-1)!;
  const $tableBody = $getGenericContentTableBody($);
  if (!$tableBody) throw new Error("No table body");
  if ("knownError" in $tableBody) throw new Error($tableBody.knownError);
  const values = $getTableValues($tableBody);
  //last row is the total
  values.pop();
  const transcript = values.map((row) => {
    const [yearsString, grade, transcriptCreditsString, adjustedCreditsString] =
      row;
    const transcriptCredits = +transcriptCreditsString!.trim();
    const adjustedCredits = +adjustedCreditsString!.trim();
    const totalCredits = transcriptCredits + adjustedCredits;
    return {
      years: yearsString!
        .trim()
        .split("-")
        .map((year) => +year) as [number, number],
      grade: +grade!.trim(),
      transcriptCredits,
      adjustedCredits,
      totalCredits,
    };
  });
  return transcript;
}
export function parseGraduationSummary({
  responses,
}: ParserFunctionArguments<"graduationSummary">): CourseRequirement[] {
  const $ = responses.at(-1)!;
  const result = parseCourseBreakdown($);

  return result;
}
const CREDITS_IN_PROGRESS_STRING = "credits in progress...";
function parseCourseBreakdown($: cheerio.CheerioAPI): CourseRequirement[] {
  const $table = $("#gradTemplateTab1-content .listGridFixed table");

  const headerValues = $table
    .find("th")
    .map((i, th) => $(th).text().trim())
    .get();
  const headerMap = Object.fromEntries(
    headerValues.map((value, index) => [value, index])
  );
  const requirementColumnIndex = headerMap["Requirement"]!;
  const result: CourseRequirement[] = [];
  let currentRequirement: CourseRequirement;
  let entriesLeftInRequirement = 0,
    lastRequirementIndex: number;

  $table
    .find("tr")
    .not(":first-child") //not the header row
    .each((i, tr) => {
      const $tr = $(tr);
      const $cells = $tr.find("td");
      const $requirementCell = $cells.eq(requirementColumnIndex);
      if (entriesLeftInRequirement === 0) {
        if (currentRequirement) result.push(currentRequirement);

        entriesLeftInRequirement = +($requirementCell.attr("rowspan") ?? 1);
        lastRequirementIndex = i;
        const requirementText = $requirementCell.text().trim();
        const [code, ...nameArray] = requirementText.split("\n");
        currentRequirement = {
          name: prettifyEducationalName(nameArray.join(" ").trim()),
          code: code!,
          entries: [],
        };
      }

      const cellsValues = [];
      for (const cell of $cells.toArray()) {
        const $cell = $(cell);
        if (+($cell.attr("colspan") ?? 1) > 1) {
          //accounting for the "No matching records" row
          entriesLeftInRequirement = 0;
          return;
        }
        const cellText = $cell.text().trim();
        cellsValues.push(cellText);
      }
      const isRequirementRow = i === lastRequirementIndex;

      if (!isRequirementRow) {
        cellsValues.unshift(""); //accounting for the requirement column in next rows
      }

      let creditAmountString =
        cellsValues[headerMap["Credits Gained (Credits Total)"]!]!;
      let isCreditAmountPending = false;
      if (creditAmountString.includes(CREDITS_IN_PROGRESS_STRING)) {
        isCreditAmountPending = true;
        creditAmountString = creditAmountString
          .replace(CREDITS_IN_PROGRESS_STRING, "")
          .trim();
      }
      currentRequirement.entries.push({
        years: cellsValues[headerMap["School year"]!]!.split("-").map(
          (year) => +year
        ) as [number, number],
        code: cellsValues[headerMap["Number"]!]!,
        grade: +cellsValues[headerMap["Grade level"]!]!,
        name: prettifyEducationalName(cellsValues[headerMap["Description"]!]!),
        equivalentContentCode:
          cellsValues[headerMap["Equivalent content code"]!] || undefined,
        isIncluded:
          $cells
            .eq(headerMap["Included"]! + (!isRequirementRow ? 1 : 0))
            .find("img").length > 0, //looking for the checkmark icon
        creditAmount: +creditAmountString,
        isCreditAmountPending,
      });
      entriesLeftInRequirement--;
    });
  return result;
}
