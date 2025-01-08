import {
  prettifySubjectName,
  TEACHER_ADVISORY_ABBREVIATION,
} from "@/helpers/prettifySubjectName";
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
  let removedItem: (typeof subject)[number] | null = null;

  subject.forEach((item) => {
    if (item.name === TEACHER_ADVISORY_ABBREVIATION) {
      removedItem = item;
    } else {
      resultArray.push(item);
    }
  });

  return {
    main: resultArray,
    teacherAdvisory: removedItem,
  };
}
export function parseSubjects(...[_, $]: ParserFunctionArguments<"subjects">) {
  const $tableContainer = $("#dataGrid");
  if ($tableContainer.length === 0) return null;

  if ($tableContainer.find(".listNoRecordsText").length > 0)
    return separateTAFromSubjects([]);

  const data = $tableContainer
    .find(".listCell")
    .toArray()
    .map((cell) => {
      const texts = $(cell)
        .children("td")
        .toArray()
        .map((td) => $(td).text().trim());

      return {
        name: prettifySubjectName(`${texts[1]}`),
        teachers: `${texts[3]}`.split(";"),
        room: `${texts[4]}`,
        gpa: normalizeGPA(texts[5]),
      };
    }) satisfies Subject[];
  return separateTAFromSubjects(data);
}
