import { fetchMyEdPage } from "@/helpers/fetchMyEdPage";
import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";

import type { TableColumnItem } from "@/types/ui";
import { JSDOM } from "jsdom";
import { ClassesTable } from "./Table";
const columns: TableColumnItem[] = [
  {
    key: "name",
    label: "Name",
  },
  { key: "teacher", label: "Teacher" },
  { key: "room", label: "Room" },
  { key: "gpa", label: "GPA" },
];
export default async function Page() {
  const html = await fetchMyEdPage("grades");
  console.log(html);
  const dom = new JSDOM(html);
  const classesTable = dom.window.document.getElementById("dataGrid");
  if (!classesTable) return null;
  const data = [...classesTable.querySelectorAll(".listCell")].map(
    (cell, i) => {
      const tds = [...cell.getElementsByTagName("td")];
      const texts = tds.map((td) => td.textContent?.trim());
      return {
        key: i,
        name: texts[1],
        teacher: texts[3],
        room: texts[4],
        gpa: texts[5],
      };
    }
  );
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold">Grades</h2>
      <SubjectsTable data={data.map((subject,i)=>({key:i,...class}))}/>
    </div>
  );
}
