import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnnouncementSection } from "@/types/school";

export function AnnouncementsSectionTable({
  rows,
}: {
  rows: Extract<AnnouncementSection, { table: any }>["table"];
}) {
  const [header, ...contentRows] = rows;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {header.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {contentRows.length > 0 ? (
          contentRows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, i) => (
                <TableCell key={i}>{cell}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={header.length} className="h-24 text-center">
              No subjects.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
