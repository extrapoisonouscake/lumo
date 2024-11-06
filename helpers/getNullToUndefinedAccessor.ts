import { AccessorFn } from "@tanstack/react-table";

export function getNullToUndefinedAccessor<T extends Record<string, any>>(
  accessorKey: keyof T
) {
  const accessorFn: AccessorFn<T> = (row) => {
    const value = row[accessorKey];
    return value === null ? undefined : value;
  };
  return accessorFn;
}
