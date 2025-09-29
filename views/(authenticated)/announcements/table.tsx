import { Link } from "@/components/ui/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalize } from "@/helpers/prettifyEducationalName";
import { AnnouncementSection } from "@/types/school";

export function AnnouncementsSectionTable({
  rows,
  pdfURL,
}: {
  pdfURL: string | null;
  rows: Extract<AnnouncementSection, { type: "table" }>["content"];
}) {
  const [header, ...contentRows] = rows;
  return (
    <Table className="[&:*]:p-0">
      {header && (
        <TableHeader>
          <TableRow>
            {header.map((column) => (
              <TableHead key={column}>
                {column.split("/").map(capitalize).join(" / ")}
              </TableHead>
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
                <Link to={pdfURL} variant="underline" target="_blank">
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
