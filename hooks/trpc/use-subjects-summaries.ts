import { Subject, SubjectSummary } from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQueries } from "@tanstack/react-query";
import { SubjectYear } from "../../types/school";

export function useSubjectSummaries<TSelected = SubjectSummary>(
  {
    ids,
    year,
  }: {
    ids?: Subject["id"][];
    year: SubjectYear;
  },
  select?: (data: SubjectSummary) => TSelected
) {
  const query = useQueries({
    queries: ids
      ? ids.map((id) =>
          getTRPCQueryOptions(trpc.myed.subjects.getSubjectInfo)({
            id,
            year,
          })
        )
      : [],
    combine: (results) => {
      const filteredData = results
        .map((result) =>
          result.data ? [result.data.id, result.data] : undefined
        )
        .filter(Boolean) as [string, SubjectSummary][];

      const transformedData = select
        ? filteredData.map(
            ([id, data]) => [id, select(data)] as [string, TSelected]
          )
        : (filteredData as [string, TSelected][]);

      return {
        data: Object.fromEntries(transformedData) as Record<string, TSelected>,
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
      };
    },
  });
  return query;
}
