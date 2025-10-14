import {
  ArrowUpDownStrokeRounded,
  Sorting01StrokeRounded,
  Sorting02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { Column } from "@tanstack/react-table";

import { motion } from "motion/react";

export function SortableColumn<TableObject, CellValue>({
  children,
  ...column
}: { children: string } & Column<TableObject, CellValue>) {
  const sortingDirection = column.getIsSorted();
  let icon;
  switch (sortingDirection) {
    case "asc":
      icon = Sorting02StrokeRounded;
      break;
    case "desc":
      icon = Sorting01StrokeRounded;
      break;
    default:
      icon = ArrowUpDownStrokeRounded;
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
        <HugeiconsIcon icon={icon} className="size-4" />
      </motion.div>
    </div>
  );
}
