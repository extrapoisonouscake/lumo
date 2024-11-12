import { prettifySubjectName } from "@/helpers/prettifySubjectName";
import { Subject } from "@/types/school";
import { JSDOM } from "jsdom";

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
    if (item.name === "TA") {
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
export function parseSubjects(dom: JSDOM) {
  const tableContainer = dom.window.document.getElementById("dataGrid");
  if (!tableContainer) return null;
  if (!!tableContainer.querySelector("listNoRecordsText")) return [];
  const data = [...tableContainer.querySelectorAll(".listCell")].map((cell) => {
    const tds = [...cell.getElementsByTagName("td")];
    const texts = tds.map((td) => td.textContent?.trim());
    return {
      name: prettifySubjectName(`${texts[1]}`),
      teacher: `${texts[3]}`,
      room: `${texts[4]}`,
      gpa: normalizeGPA(texts[5]),
    };
  }) satisfies Subject[];
  return separateTAFromSubjects(data);
}
