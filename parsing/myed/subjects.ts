import { getGradeLetter } from "@/helpers/grades";
import {
  prettifyEducationalName,
  TEACHER_ADVISORY_ABBREVIATION,
} from "@/helpers/prettifyEducationalName";
import { locallyTimezonedDayJS } from "@/instances/dayjs";
import {
  RichSubjectAttendance,
  Subject,
  SubjectSummary,
  SubjectTerm,
  TermEntry,
} from "@/types/school";
import { DeepWithRequired } from "@/types/utils";

import { $getTableBody, MYED_TABLE_HEADER_SELECTOR } from "./helpers";
import { OpenAPI200JSONResponse, ParserFunctionArguments } from "./types";

const convertStringToGradeObject = (string?: string | null) => {
  if (!string) return null;
  const [mark, ...letter] = string.split(" ");
  if (!mark || isNaN(+mark)) return null; //TODO handle edge cases
  const markAsNumber = +mark;
  const existingLetter = letter.join("").trim();

  return {
    mark: markAsNumber,
    letter:
      existingLetter.length > 0 ? existingLetter : getGradeLetter(markAsNumber),
  };
};

// const parseSubjectTeachersString = (string: string) => {
//   return string.split(";").map((name) => name.split(", ").reverse().join(" "));
// };
function separateTeacherAdvisoryFromSubjects(subject: Subject[]) {
  const resultArray: typeof subject = [];
  let removedItem;

  subject.forEach((item) => {
    if (item.name === TEACHER_ADVISORY_ABBREVIATION) {
      removedItem = item;
    } else {
      resultArray.push(item);
    }
  });

  return {
    main: resultArray,
    teacherAdvisory: (removedItem as unknown as Subject) ?? null,
  };
}
type SubjectResponse = DeepWithRequired<
  OpenAPI200JSONResponse<"/lists/academics.classes.list">[number],
  | "relSscMstOid_mstDescription"
  | "relSscMstOid_mstStaffView"
  | "cfTermAverage"
  | "relSscMstOid_mstRoomView"
>;
const termRawValueToNormalized: Record<string, SubjectTerm> = {
  FY: SubjectTerm.FullYear,
  S1: SubjectTerm.FirstSemester,
  S2: SubjectTerm.SecondSemester,
  Q1: SubjectTerm.FirstQuarter,
  Q2: SubjectTerm.SecondQuarter,
  Q3: SubjectTerm.ThirdQuarter,
  Q4: SubjectTerm.FourthQuarter,
};

const convertSubject = ({
  relSscMstOid_mstDescription,
  relSscMstOid_mstStaffView,
  cfTermAverage,
  relSscMstOid_mstRoomView,
  oid,
  sscTermView,
}: SubjectResponse) => ({
  id: oid,
  actualName: relSscMstOid_mstDescription,
  name: prettifyEducationalName(relSscMstOid_mstDescription),
  teachers: relSscMstOid_mstStaffView.map((item) => item.name),
  room: relSscMstOid_mstRoomView ?? null,
  term: sscTermView ? termRawValueToNormalized[sscTermView] : undefined,
});
export function parseSubjects({
  responses: [gradeTerms, data],
}: ParserFunctionArguments<
  "subjects",
  [
    OpenAPI200JSONResponse<"/lists/academics.classes.list/studentGradeTerms">,
    SubjectResponse[]
  ]
>): {
  terms: TermEntry[];
  subjects: {
    main: Subject[];
    teacherAdvisory: Subject | null;
  };
} {
  const preparedData = data.map(convertSubject);
  const preparedTerms = gradeTerms.map((item) => ({
    id: item.oid,
    name: item.gradeTermId,
  }));
  return {
    terms: preparedTerms,
    subjects: separateTeacherAdvisoryFromSubjects(preparedData),
  };
}

type SubjectSummaryResponse = DeepWithRequired<
  OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/academics">,
  "section.sscTermView"
>;
const convertAttendanceSummary = (
  items: SubjectSummaryResponse["attendanceSummary"]
) => {
  const result: SubjectSummary["attendance"] = {
    tardy: 0,
    absent: 0,
    dismissed: 0,
  };
  for (const item of items) {
    switch (item.type) {
      case "Absent":
        result.absent = item.total;
        break;
      case "Tardy":
        result.tardy = item.total;
        break;
      case "Dismissed":
        result.dismissed = item.total;
        break;
    }
  }
  return result;
};
const NOT_APPLICABLE_MARK = "N/A";
type RawSubjectSummary = ParserFunctionArguments<
  "subjectSummary",
  [SubjectSummaryResponse]
>;
const convertAcademicCategory = (
  item: SubjectSummaryResponse["averageSummary"][number]
): SubjectSummary["academics"]["categories"][number] => {
  const termsEntries = Object.entries(item).filter(([key]) =>
    key.startsWith("Q")
  );
  return {
    id: item.categoryOid,
    name: prettifyEducationalName(item.category),
    average: convertStringToGradeObject(item.overall),
    terms: termsEntries.map(([key, value]) => {
      const percentage = item[`percentage${key}` as keyof typeof item];
      const avgView = item[`avgView${key}` as keyof typeof item];
      return {
        name: key,
        weight:
          percentage && percentage !== NOT_APPLICABLE_MARK
            ? +percentage.slice(0, -1)
            : null,
        average: convertStringToGradeObject(value ?? avgView),
      };
    }),
  };
};
const GRADES_SUMMARY_ITEM_STATIC_KEYS = [
  "category",
  "categoryOid",
  "overall",
  "running",
];
const GRADES_SUMMARY_ITEM_STATIC_PREFIXES = ["avg", "percentage"];
const getGradesSummaryItemFluidKeys = (keys: string[]) => {
  //e.g. {overall,Q1,Q2,percentageQ2}=>{Q1,Q2}
  return keys.filter(
    (key) =>
      !GRADES_SUMMARY_ITEM_STATIC_KEYS.includes(key) &&
      !GRADES_SUMMARY_ITEM_STATIC_PREFIXES.some((prefix) =>
        key.startsWith(prefix)
      )
  );
};
function getSubjectAverages(
  data: RawSubjectSummary["responses"][number]["averageSummary"][number]
) {
  const termsEntries = getGradesSummaryItemFluidKeys(Object.keys(data)).map(
    (key) => [key, data[key as keyof typeof data]]
  );
  const fluidTermsData = termsEntries.map(
    ([key, value]) =>
      [key, convertStringToGradeObject(value)] as [
        string,
        ReturnType<typeof convertStringToGradeObject>
      ]
  );

  return {
    ...Object.fromEntries(fluidTermsData),
    overall: convertStringToGradeObject(data.overall ?? data.running),
  } as SubjectSummary["academics"]["running"];
}
export function parseSubjectSummary({
  responses: [data],
  params: { year },
}: RawSubjectSummary): SubjectSummary {
  const {
    section,
    averageSummary,
    attendanceSummary,
    postedSummary,
    currentGradeTermIndex,
  } = data;
  const result: SubjectSummary = {
    id: section.oid,
    name: prettifyEducationalName(section.relSscMstOid_mstDescription),
    term: termRawValueToNormalized[section.sscTermView]!,
    academics: {
      running: { overall: null },
      posted: { overall: null },
      categories: [],
    },
    currentTermIndex:
      currentGradeTermIndex !== "" ? +currentGradeTermIndex : null,
    attendance: {
      absent: 0,
      dismissed: 0,
      tardy: 0,
    },
    year,
  };
  if (averageSummary.length > 0) {
    const gradebookAverageIndex = averageSummary.findIndex(
      //* STATIC NAME
      (item) => item.category === "Gradebook average"
    );
    const runningAveragesObject = averageSummary[gradebookAverageIndex]!; //? is it always present
    const categories = averageSummary.filter(
      (_, index) => index !== gradebookAverageIndex
    );
    //TODO: clarify variable names
    const postedAverages = getSubjectAverages(postedSummary[0]!);
    const runningAverages = getSubjectAverages(runningAveragesObject);
    if (!runningAverages.overall) {
      const postedAveragesValues = Object.entries(postedAverages)
        .filter(([key, value]) => key !== "overall" && value?.mark)
        .map(([, value]) => value?.mark);

      if (postedAveragesValues.length > 0) {
        runningAverages.overall = {
          mark:
            postedAveragesValues.reduce(
              (prev: number, cur) => prev + (cur ?? 0),
              0
            ) / postedAveragesValues.length,
          letter: null,
        };
      }
    }
    const academics: SubjectSummary["academics"] = {
      running: runningAverages,
      posted: postedAverages,
      categories: categories.map(convertAcademicCategory),
    };
    result.academics = academics;
  }
  const attendance = convertAttendanceSummary(attendanceSummary);
  result.attendance = attendance;

  return result;
}
export function parseSubjectIdByName({
  metadata: { subjectId },
}: ParserFunctionArguments<
  "subjectIdByName",
  [OpenAPI200JSONResponse<"/lists/academics.classes.list">]
>): string {
  return subjectId;
}
export function parseSubjectAttendance({
  responses,
}: ParserFunctionArguments<"subjectAttendance">): RichSubjectAttendance {
  const $ = responses.at(-1)!;
  const $tableBody = $getTableBody($);
  if (!$tableBody) throw new Error("No table body");
  if ("knownError" in $tableBody) {
    const knownError = $tableBody.knownError;
    if (knownError === "No matching records") return [];
    throw new Error(knownError);
  }
  const data: RichSubjectAttendance = [];
  $tableBody
    .children("tr")
    .not(MYED_TABLE_HEADER_SELECTOR)
    .each((_, tr) => {
      const $tr = $(tr);
      const $date = $tr.find("td:nth-of-type(2)");
      const date = locallyTimezonedDayJS(
        $date.text().trim(),
        "M/D/YYYY"
      ).toDate();
      const code = $tr.find("td:nth-of-type(3)").text().trim();
      const reason = $tr.find("td:nth-of-type(4)").text().trim();
      data.push({
        date,
        code,
        reason,
      });
    });
  return data;
}
