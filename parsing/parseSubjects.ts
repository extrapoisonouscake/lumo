import { Subject } from "@/types/school";
import { JSDOM } from "jsdom";
const normalizeGPA = /^\d+(\.\d+)?(?=\s[A-Za-z])/;
export function parseSubjects(html: string) {
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
        gpa: +`${texts[5]}`.match(gpaRegex)?.[0],
      };
    }
  );
  return data satisfies Subject[];
}
