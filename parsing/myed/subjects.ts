import {
  prettifyEducationalName,
  TEACHER_ADVISORY_ABBREVIATION,
} from "@/helpers/prettifyEducationalName";
import {
  Subject,
  SubjectSummary,
  SubjectTerm,
  TermEntry,
} from "@/types/school";
import { DeepWithRequired } from "@/types/utils";
import { OpenAPI200JSONResponse, ParserFunctionArguments } from "./types";

const gpaRegex = /^\d+(\.\d+)?(?=\s[A-Za-z]|$)/;
const normalizeMarkWithLetter = (string?: string) => {
  if (!string) return null;
  const result = string.match(gpaRegex);
  if (!result) return null;
  return +result[0];
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
  average: normalizeMarkWithLetter(cfTermAverage),
  term: sscTermView ? termRawValueToNormalized[sscTermView] : null,
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
const convertAcademicCategory = (
  item: SubjectSummaryResponse["averageSummary"][number]
): SubjectSummary["academics"]["categories"][number] => {
  const termsEntries = Object.entries(item).filter(([key]) =>
    key.startsWith("Q")
  );
  return {
    id: item.categoryOid,
    name: prettifyEducationalName(item.category),
    average: normalizeMarkWithLetter(item.overall),
    terms: termsEntries.map(([key, value]) => ({
      name: key,
      weight: +(item[`percentage${key}` as keyof typeof item] as string).slice(
        0,
        -1
      ),
      average: +value,
    })),
  };
};
export function parseSubjectSummary({
  responses: [data],
}: ParserFunctionArguments<
  "subjectSummary",
  [SubjectSummaryResponse]
>): SubjectSummary {
  const { section, averageSummary, attendanceSummary, postedSummary } = data;
  const result: SubjectSummary = {
    id: section.oid,
    name: prettifyEducationalName(section.relSscMstOid_mstDescription),
    term: termRawValueToNormalized[section.sscTermView],
    academics: {
      average: null,
      posted: null,
      categories: [],
    },
    attendance: {
      absent: 0,
      dismissed: 0,
      tardy: 0,
    },
  };
  if (averageSummary.length > 0) {
    const gradebookAverageIndex = averageSummary.findIndex(
      (item) => item.category === "Gradebook average"
    );
    const gradebookAverage = averageSummary[gradebookAverageIndex];
    const categories = averageSummary.filter(
      (_, index) => index !== gradebookAverageIndex
    );
    const overallPostedGrade = postedSummary[0].overall;
    const academics: SubjectSummary["academics"] = {
      average: normalizeMarkWithLetter(gradebookAverage.overall),
      posted: overallPostedGrade ? +overallPostedGrade : null,
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
