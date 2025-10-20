import { Subject, SubjectSummary } from "@/types/school";
import { getTRPCQueryOptions, queryClient, trpc } from "@/views/trpc";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SubjectYear } from "../../types/school";
const getQueries = ({
  ids,
  year,
}: {
  ids?: Subject["id"][];
  year: SubjectYear;
}) => {
  return ids
    ? ids.map((id) =>
        getTRPCQueryOptions(trpc.myed.subjects.getSubjectInfo)({
          id,
          year,
        })
      )
    : [];
};
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
  const [queries, setQueries] = useState(() => getQueries({ ids, year }));
  useEffect(() => {
    if (queries) {
      const newQueries = getQueries({ ids, year });
      const differentQueries = queries.filter(
        (q) =>
          !newQueries.some(
            (nq) => nq.queryKey.join(",") === q.queryKey.join(",")
          )
      );

      differentQueries.forEach((q) => {
        queryClient.cancelQueries({ queryKey: q.queryKey });
      });
      setQueries(newQueries);
    } else {
      setQueries(getQueries({ ids, year }));
    }
  }, [ids?.join(","), year]);
  const query = useQueries({
    queries,
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
        isFetching: results.some((result) => result.isFetching),
        isError: results.some((result) => result.isError),
        isPaused: results.some((result) => result.isPaused),
      };
    },
  });

  return query;
}
