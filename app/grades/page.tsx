import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchMyEdPage } from "@/helpers/fetchMyEdPage";

import { JSDOM } from "jsdom";
export default async function Page() {
  const html = await fetchMyEdPage("grades");
  console.log(html);
  const dom = new JSDOM(html);
  const classesTable = dom.window.document.getElementById("dataGrid");
  if (!classesTable) return null;
  const data = [...classesTable.querySelectorAll(".listCell")].map((cell) => {
    const tds = [...cell.getElementsByTagName("td")];
    const texts = tds.map((td) => td.textContent?.trim());
    return { name: texts[1], teacher: texts[3], room: texts[4], gpa: texts[5] };
  });
  console.log({ data });
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold">Grades</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Average</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead className="text-right">Classroom #</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.gpa}</TableCell>
              <TableCell>{row.teacher}</TableCell>
              <TableCell className="text-right">{row.room}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
