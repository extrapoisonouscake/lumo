import {
  prettifySubjectName,
  TEACHER_ADVISORY_ABBREVIATION,
} from "@/helpers/prettifySubjectName";
import { Subject, Term } from "@/types/school";
import { DeepWithRequired } from "@/types/utils";
import { OpenAPI200JSONResponse, ParserFunctionArguments } from "./types";

const gpaRegex = /^\d+(\.\d+)?(?=\s[A-Za-z]|$)/;
const normalizeAverage = (string?: string) => {
  if (!string) return null;
  const result = string.match(gpaRegex);
  if (!result) return null;
  return +result[0];
};

// const parseSubjectTeachersString = (string: string) => {
//   return string.split(";").map((name) => name.split(", ").reverse().join(" "));
// };
function separateTAFromSubjects(subject: Subject[]) {
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
  OpenAPI200JSONResponse<"/lists/academics.classes.list">,
  | "relSscMstOid_mstDescription"
  | "relSscMstOid_mstStaffView"
  | "cfTermAverage"
  | "relSscMstOid_mstRoomView"
>[number];
const termRawValueToNormalized: Record<string, string> = {
  FY: "Full Year",
  S1: "First Semester",
  S2: "Second Semester",
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
  name: prettifySubjectName(relSscMstOid_mstDescription),
  teachers: relSscMstOid_mstStaffView.map((item) => item.name),
  room: relSscMstOid_mstRoomView ?? null,
  average: normalizeAverage(cfTermAverage),
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
  terms: Term[];
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
    subjects: separateTAFromSubjects(preparedData),
  };
}
export function parseSubject({
  metadata: { subject },
}: ParserFunctionArguments<
  "subject",
  [
    DeepWithRequired<
      OpenAPI200JSONResponse<"/lists/academics.classes.list">,
      "relSscMstOid_mstDescription" | "relSscMstOid_mstStaffView"
    >
  ]
>): Subject {
  return convertSubject(subject);
}
