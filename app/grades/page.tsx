import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import { JSDOM } from "jsdom";
import { cookies } from "next/headers";
export default async function Page() {
  const myEdCookies = [...cookies()]
    .filter(
      ([name]) =>
        name.startsWith("myed.") &&
        [
          "ApplicationGatewayAffinity",
          "ApplicationGatewayAffinityCORS",
          "JSESSIONID",
          "deploymentId",
        ]
          .map((e) => `myed.${e}`)
          .includes(name)
    )
    .map(([name, cookie]) => `${name.replace("myed.", "")}=${cookie.value}`)
    .join("; ");
  console.log({ myEdCookies });
  const htmlResponse = await fetch(getEndpointUrl("grades"), {
    headers: { Cookie: myEdCookies },
  });
  const html = await htmlResponse.text();

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
