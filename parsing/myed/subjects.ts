import {
  prettifySubjectName,
  TEACHER_ADVISORY_ABBREVIATION,
} from "@/helpers/prettifySubjectName";
import { paths } from "@/types/myed-rest";
import { Subject } from "@/types/school";
import { ParserFunctionArguments } from "./types";

const gpaRegex = /^\d+(\.\d+)?(?=\s[A-Za-z]|$)/;
const normalizeGPA = (string?: string) => {
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

export function parseSubjects(...p: ParserFunctionArguments<'subjects'>) {
  console.log(p)
  const [, data] = p
  console.log({ data })
  const preparedData = (data as paths['/lists/academics.classes.list']['get']['responses']['200']['content']['application/json']).map(({ relSscMstOid_mstDescription, relSscMstOid_mstStaffView, cfTermAverage, relSscMstOid_mstRoomView }) => ({ name: prettifySubjectName(relSscMstOid_mstDescription), teachers: relSscMstOid_mstStaffView.map(item => item.name), room: relSscMstOid_mstRoomView ?? null, gpa: normalizeGPA(cfTermAverage), actualName: relSscMstOid_mstDescription }))
  return separateTAFromSubjects(preparedData);
}