import { trpc } from "@/app/trpc";
import { Subject } from "@/types/school";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

export function useRecentAssignments(subjects?: Subject[]) {
  const subjectsMap = useMemo(() => {
    return subjects?.reduce((acc, subject) => {
      acc[subject.id] = subject;
      return acc;
    }, {} as Record<string, Subject>);
  }, [subjects]);
  const query = useQueries({
    queries: subjects
      ? subjects.map((subject) =>
          trpc.myed.subjects.getSubjectAssignments.queryOptions({
            id: subject.id,
            term: subject.term,
          })
        )
      : [],
    combine: (results) => {
      if (!subjects) return { progress: 0, data: [] };
      return {
        data: results
          .filter((result) => result.data)
          .map((result) =>
            result.data!.assignments.map((assignment) => ({
              ...assignment,
              subject: subjectsMap![result.data!.subjectId]!,
            }))
          )
          .flat(),

        progress:
          1 -
          results.filter((result) => result.isFetching).length / results.length,
      };
    },
  });
  return query;
}
