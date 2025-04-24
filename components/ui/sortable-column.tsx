import { Column } from "@tanstack/react-table";
import { motion } from "framer-motion";
import {
  ArrowDownNarrowWide,
  ArrowUpDown,
  ArrowUpWideNarrow,
} from "lucide-react";
import { Button } from "./button";

export function SortableColumn<TableObject, CellValue>({
  children,
  ...column
}: { children: string } & Column<TableObject, CellValue>) {
  const sortingDirection = column.getIsSorted();
  let Icon;
  switch (sortingDirection) {
    case "asc":
      Icon = ArrowDownNarrowWide;
      break;
    case "desc":
      Icon = ArrowUpWideNarrow;
      break;
    default:
      Icon = ArrowUpDown;
  }
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting()}>
      {children}
      <motion.div
        key={`${sortingDirection}`}
        initial={sortingDirection ? { rotate: 180 } : false}
        animate={{
          rotate: 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="size-4"
      >
        <Icon />
      </motion.div>
    </Button>
  );
}
