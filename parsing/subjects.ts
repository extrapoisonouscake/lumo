import { Subject } from "@/types/school";
import { JSDOM } from "jsdom";
const gpaRegex = /^\d+(\.\d+)?(?=\s[A-Za-z]|$)/;
const normalizeGPA = (string?: string) => {
  if (!string) return null;
  const result = string.match(gpaRegex);
  if (!result) return null;
  return +result[0];
};
export function parseSubjects(html: string) {
  const dom = new JSDOM(html);
  const classesTable = dom.window.document.getElementById("dataGrid");
  if (!classesTable) return null;
  const data = [...classesTable.querySelectorAll(".listCell")].map((cell) => {
    const tds = [...cell.getElementsByTagName("td")];
    const texts = tds.map((td) => td.textContent?.trim());
    return {
      name: `${texts[1]}`,
      teacher: `${texts[3]}`,
      room: `${texts[4]}`,
      gpa: normalizeGPA(texts[5]),
    };
  });
  return data satisfies Subject[];
}
export function parseSchedule(html: string) {
  const dom = new JSDOM(html);
  const classesTable = dom.window.document.getElementById("dataGrid");
  if (!classesTable) return null;
  const data = [...classesTable.querySelectorAll(".listCell")].map(
    (cell, i) => {
      const tds = [...cell.getElementsByTagName("td")];
      const texts = tds.map((td) => td.textContent?.trim());
      return {
        name: `${texts[1]}`,
        teacher: `${texts[3]}`,
        room: `${texts[4]}`,
        gpa: normalizeGPA(texts[5]),
      };
    }
  );
  return data satisfies Subject[];
}
