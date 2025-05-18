import { trpc } from "@/app/trpc";
import { Subject, SubjectSummary } from "@/types/school";
import { useQueries } from "@tanstack/react-query";

export function useSubjectSummaries({ ids }: { ids?: Subject["id"][] }) {
  const query = useQueries({
    queries: ids
      ? ids.map((id) =>
          trpc.myed.subjects.getSubjectInfo.queryOptions({
            id,
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
