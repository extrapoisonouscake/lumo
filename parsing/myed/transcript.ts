import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";
import {
  CreditSummaryEntry,
  ProgramEntry,
  ProgramMinifiedRequirement,
  ProgramRequirement,
  ProgramRequirementEntryStatus,
  TranscriptEducationPlan,
  TranscriptEntry,
} from "@/types/school";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
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
      grade: +grade!,
      subjectName: prettifyEducationalName(subject!),
      finalGrade: finalGrade ? +finalGrade : null,
      creditAmount: +credit!,
    };
  });
  return transcript;
}
const NUMBER_EXTRACT_REGEX = /^\d+(\.\d+)?$/;
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
}: ParserFunctionArguments<"graduationSummary">): {
  breakdown: ProgramRequirement[];
  programs: ProgramEntry[];
  educationPlans: TranscriptEducationPlan[];
} {
  const $ = responses.at(-1)!;
  const breakdown = parseCourseBreakdown($);

  const programs = parsePrograms($);

  const programsWithNames = programs.map((program) => {
    const getPendingUnits = (requirement: ProgramMinifiedRequirement) => {
      const units = breakdown
        .find((course) => course.code === requirement.code)
        ?.entries.filter(
          (entry) => entry.status === ProgramRequirementEntryStatus.Pending
        )
        .reduce((acc, entry) => acc + (entry.completedUnits ?? 0), 0);

      return units;
    };
    const requirementsWithPendingUnits = program.requirements?.map(
      (requirement) => ({
        ...requirement,
        name: breakdown.find((course) => course.code === requirement.code)
          ?.name,
        pendingUnits: getPendingUnits(requirement),
        requirements: requirement.requirements?.map((nestedRequirement) => ({
          ...nestedRequirement,
          pendingUnits: getPendingUnits(nestedRequirement),
        })),
      })
    );
    const pendingUnits = requirementsWithPendingUnits
      ?.flatMap((requirement) => [
        requirement.pendingUnits,
        ...(requirement.requirements?.map(
          (requirement) => requirement.pendingUnits
        ) ?? []),
      ])
      .reduce((acc, curr) => (acc ?? 0) + (curr ?? 0), 0);
    let limitedPendingUnits = 0;

    for (const requirement of requirementsWithPendingUnits ?? []) {
      limitedPendingUnits += Math.max(
        0,
        Math.min(
          requirement.pendingUnits ?? 0,
          requirement.requiredUnits - requirement.completedUnits
        )
      );
    }

    return {
      ...program,
      requirements: requirementsWithPendingUnits,
      pendingUnits,
      limitedPendingUnits,
    };
  });

  const plans = parseEducationPlans($);

  const allEntries = breakdown.flatMap((requirement) => requirement.entries);
  const preparedBreakdown = breakdown.map((requirement) => ({
    ...requirement,
    entries: requirement.entries.map((entry) => ({
      ...entry,
      alternativeEntry:
        entry.status === ProgramRequirementEntryStatus.AlreadyCounted
          ? allEntries.find(
              (item) =>
                item.code === entry.code &&
                item.status !== ProgramRequirementEntryStatus.AlreadyCounted
            )
          : undefined,
    })),
  }));
  return {
    breakdown: preparedBreakdown,
    programs: programsWithNames,
    educationPlans: plans,
  };
}
function parseEducationPlans($: cheerio.CheerioAPI): TranscriptEducationPlan[] {
  const plans = $(`select[name="selectedProgramStudiesOid"] option`)
    .map((_, el) => {
      const $el = $(el);
      return {
        id: $el.val() as string,
        name: $el.text().trim(),
        isInitial: $el.attr("selected") === "selected",
      };
    })
    .toArray();
  return plans;
}
const parseEducationPlanCompletedUnits = (string: string) => {
  const match = string.match(/^(\d+(?:\.\d+)?)(?:\s*\((\d+(?:\.\d+)?)\))?$/);

  if (!match)
    throw new Error(`Invalid education plan completed units: ${string}`);
  const [, completedUnits, excessUnits = "0"] = match;
  return {
    completedUnits: +completedUnits!,
    excessUnits: +excessUnits,
  };
};
function parsePrograms($: cheerio.CheerioAPI): ProgramEntry[] {
  const $table = $(".listGridFixed:first table");
  const headerMap = getHeaderMap($table);
  const result: ProgramEntry[] = [];

  $table
    .find("tbody")
    .first()
    .children("tr")
    .not(":first-child, :last-child") //not the header row or the total row
    .each((i, tr) => {
      const $tr = $(tr);
      const $cells = $tr.children("td");

      const cellsValues = [];
      for (const cell of $cells.toArray()) {
        const $cell = $(cell);

        const cellText = $cell.text().trim();
        cellsValues.push(cellText);
      }

      const $descriptionCell = $cells.eq(headerMap["Description"]!);
      const $requirementsRow = $descriptionCell.find("tr[id]"); //the only row that has an id
      let requirements: ProgramEntry["requirements"] | undefined;
      if ($requirementsRow.children().length > 0) {
        requirements = [];
        $requirementsRow
          .find("tbody")
          .first()
          .children("tr")
          .map((i, tr) => {
            const $tr = $requirementsRow.find(tr);
            const $childTbody = $tr.find("tbody tbody");
            if ($childTbody.length > 0) {
              //*found child requirements
              //nested tables everywhere, im crying so hard rn
              const childRequirements: ProgramMinifiedRequirement[] = [];

              $childTbody.children("tr").each((i, tr) => {
                const $tr = $(tr);
                const requirement = getMinifiedRequirements($tr);
                if (requirement) {
                  childRequirements.push(requirement);
                }
              });
              requirements!.at(-1)!.requirements = childRequirements;
            } else {
              const requirement = getMinifiedRequirements($tr);
              if (requirement) {
                requirements!.push(requirement);
              }
            }
          });
      }

      const creditsWaivedString =
        cellsValues[headerMap["Credits waived"]!]!.trim();
      const { completedUnits, excessUnits } = parseEducationPlanCompletedUnits(
        cellsValues[headerMap["Unit completed"]!]!.trim()
      );
      result.push({
        name: $cells.eq(headerMap["Description"]!).find("a").text().trim(), //rest of the content are the minified requirements
        code: cellsValues[headerMap["Code"]!]!,
        requiredUnits: requirements
          ? requirements.reduce(
              (acc, requirement) =>
                acc +
                requirement.requiredUnits +
                (requirement.requirements?.reduce(
                  (acc, requirement) => acc + requirement.requiredUnits,
                  0
                ) ?? 0),
              0
            )
          : +cellsValues[headerMap["Required unit"]!]!.trim(),
        completedUnits,

        excessUnits,
        creditsWaived:
          creditsWaivedString.length > 0 ? +creditsWaivedString : undefined,
        requirements,
        isIncluded: !($cells.eq(headerMap["Excluded"]!).find("img").length > 0), //looking for the checkmark icon, checkmark means "Excluded"
      });
    });
  return result;
}
function getMinifiedRequirements($tr: cheerio.Cheerio<Element>) {
  const text = $tr.text().trim();
  if (!text || !text.includes("Code")) return; //filtering out unnecessary text and totals

  const [code, requiredUnits, creditsWaived, completedUnitsObject] = text
    .split("\n")
    .map((section, i) => {
      const [label, value] = section.split(": ");
      const trimmedValue = value?.trim();
      if (!trimmedValue) return undefined;
      //last section is the completed units with possible excess units
      if (i === 3) {
        return parseEducationPlanCompletedUnits(trimmedValue);
      }
      return isNaN(+trimmedValue) ? trimmedValue : +trimmedValue;
    });
  const { completedUnits, excessUnits } = completedUnitsObject as ReturnType<
    typeof parseEducationPlanCompletedUnits
  >;
  return {
    code: code as string,
    requiredUnits: Math.max(requiredUnits as number, completedUnits as number), //sometimes required units is set to zero
    completedUnits,
    excessUnits,
    creditsWaived: creditsWaived as number,
  };
}
const CREDITS_IN_PROGRESS_STRING = "credits in progress...";
function parseCourseBreakdown($: cheerio.CheerioAPI): ProgramRequirement[] {
  const $table = $("#gradTemplateTab1-content .listGridFixed table");

  const headerMap = getHeaderMap($table);
  const requirementColumnIndex = headerMap["Requirement"]!;
  const result: ProgramRequirement[] = [];
  let currentRequirement: ProgramRequirement | undefined;
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
      let isCreditAmountPending = creditAmountString.includes(
          CREDITS_IN_PROGRESS_STRING
        ),
        isAlreadyCounted = creditAmountString.startsWith("(");
      if (isCreditAmountPending) {
        creditAmountString = creditAmountString.replace(
          CREDITS_IN_PROGRESS_STRING,
          ""
        );
      } else if (isAlreadyCounted) {
        //this means this entry is counted toward another requirement
        creditAmountString = creditAmountString
          .replace("(", "")
          .replace(")", "");
        isAlreadyCounted = true;
      }
      let status = ProgramRequirementEntryStatus.Excluded;
      if (isCreditAmountPending) {
        status = ProgramRequirementEntryStatus.Pending;
      } else if (isAlreadyCounted) {
        status = ProgramRequirementEntryStatus.AlreadyCounted;
      } else if (
        $cells
          .eq(headerMap["Included"]! - (!isRequirementRow ? 1 : 0))
          .find("img").length > 0
      ) {
        //looking for the checkmark icon)
        status = ProgramRequirementEntryStatus.Included;
      }
      currentRequirement!.entries.push({
        years: cellsValues[headerMap["School year"]!]!.split("-").map(
          (year) => +year
        ) as [number, number],
        code: cellsValues[headerMap["Number"]!]!,
        grade: +cellsValues[headerMap["Grade level"]!]!,
        name: prettifyEducationalName(cellsValues[headerMap["Description"]!]!),
        equivalentContentCode:
          cellsValues[headerMap["Equivalent content code"]!] || undefined,
        status,
        completedUnits: +creditAmountString.trim(),
        requirement: {
          name: currentRequirement!.name,
          code: currentRequirement!.code,
          totalEntries: currentRequirement!.entries.length,
        },
      });
      entriesLeftInRequirement--;
    });
  if (currentRequirement) result.push(currentRequirement);
  return result;
}
function getHeaderMap(
  $table: cheerio.Cheerio<Element>
): Record<string, number> {
  const headerValues = $table
    .find("tr")
    .first()
    .children()
    .map((i, th) => $table.find(th).text().trim())
    .get();
  const headerMap = Object.fromEntries(
    headerValues
      .map((value, index) => [value, index])
      .filter(([value]) => value)
  );
  return headerMap;
}
