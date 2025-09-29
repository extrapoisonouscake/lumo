import { Subject, SubjectSummary } from "@/types/school";
import { trpc } from "@/views/trpc";
import { useQueries } from "@tanstack/react-query";
import { SubjectYear } from "../../types/school";

export function useSubjectSummaries({
  ids,
  year,
}: {
  ids?: Subject["id"][];
  year: SubjectYear;
}) {
  const query = useQueries({
    queries: ids
      ? ids.map((id) =>
          trpc.myed.subjects.getSubjectInfo.queryOptions({
            id,
            year,
          })
        )
      : [],
    combine: (results) => {
      return {
        data: Object.fromEntries(
          results
            .map((result) =>
              result.data ? [result.data.id, result.data] : undefined
            )
            .filter(Boolean) as [string, SubjectSummary][]
        ),
        isLoading: results.some((result) => result.isLoading),
      };
    },
  });
  return query;
}
