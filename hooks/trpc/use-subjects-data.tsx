import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectsData({
  isPreviousYear = false,
  termId,
}: {
  isPreviousYear?: boolean;
  termId?: string;
} = {}) {
  const query = useQuery(
    trpc.subjects.getSubjects.queryOptions({
      isPreviousYear,
      termId,
    })
  );
  return query;
}
