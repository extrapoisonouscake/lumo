import { Column } from "@tanstack/react-table";
import { motion } from "framer-motion";
import {
  ArrowDownNarrowWide,
  ArrowUpDown,
  ArrowUpWideNarrow,
} from "lucide-react";

export function SortableColumn<TableObject, CellValue>({
  children,
  ...column
}: { children: string } & Column<TableObject, CellValue>) {
  const sortingDirection = column.getIsSorted();
  let Icon;
  switch (sortingDirection) {
    case "asc":
      Icon = ArrowUpWideNarrow;
      break;
    case "desc":
      Icon = ArrowDownNarrowWide;
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
