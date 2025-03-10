import { Link } from "@/components/ui/link";
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
  pdfURL,
}: {
  pdfURL: string | null;
  rows: Extract<AnnouncementSection, { table: any }>["table"];
}) {
  const [header, ...contentRows] = rows;
  return (
    <Table className="[&:*]:p-0">
      {header && (
        <TableHeader>
          <TableRow>
            {header.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
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
            <TableCell
              colSpan={header?.length}
              className="h-24 text-center border-0"
            >
              Please open{" "}
              {pdfURL ? (
                <Link href={pdfURL} variant="underline" target="_blank">
                  the original file
                </Link>
              ) : (
                "the original file"
              )}{" "}
              to view this content.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
