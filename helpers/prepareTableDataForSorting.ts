export function prepareTableDataForSorting<T extends Record<string, any>>(
  data: T[]
) {
  return data.map((object) =>
    Object.fromEntries(
      Object.entries(object).map(([key, value]) => [
        key,
        value === null ? undefined : value,
      ])
    )
  ) as T[];
}
