import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectsData(
  {
    isPreviousYear,
    termId,
  }: {
    isPreviousYear: boolean;
    termId?: string;
  } = { isPreviousYear: false, termId: undefined }
) {
  const query = useQuery(
    trpc.myed.subjects.getSubjects.queryOptions({
      isPreviousYear,
      termId,
    })
  );
  return query;
}
