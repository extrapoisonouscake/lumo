"use client";
import { Subject } from "@/types/school";
import { TableColumnItem } from "@/types/ui";
import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
const columns: TableColumnItem<keyof Props["data"][number]>[] = [
  {
    key: "name",
    label: "Name",
  },
  { key: "teacher", label: "Teacher" },
  { key: "room", label: "Room" },
  { key: "gpa", label: "GPA" },
];
interface Props {
  data: (Subject & { key: number })[];
}
export function SubjectsTable({ data }: Props) {
  return (
    <Table aria-label="Classes">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
