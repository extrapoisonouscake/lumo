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
function separateTAFromSubjects(array: Subject[]) {
  const resultArray: typeof array = [];
  let removedItem: (typeof array)[number] | null = null;

  array.forEach((item) => {
    if (item.name === "TA") {
      if (removedItem === null) {
        removedItem = item;
      }
    } else {
      resultArray.push(item);
    }
  });

  return {
    main: resultArray,
    teacherAdvisory: removedItem,
  };
}
export function parseSubjects(html: string) {
  const dom = new JSDOM(html);
  const classesTable = dom.window.document.getElementById("dataGrid");
  if (!classesTable) return null;
  const data = [...classesTable.querySelectorAll(".listCell")].map((cell) => {
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
