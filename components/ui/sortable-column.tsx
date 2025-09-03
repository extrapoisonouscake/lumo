import { Column } from "@tanstack/react-table";
import {
  ArrowDownNarrowWide,
  ArrowUpDown,
  ArrowUpWideNarrow,
} from "lucide-react";
import { motion } from "motion/react";

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
    <div
      className="flex items-center gap-1.5 cursor-pointer"
      onClick={() => column.toggleSorting()}
    >
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
        <Icon className="size-4" />
      </motion.div>
    </div>
  );
}
