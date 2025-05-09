import { queryClient, trpc } from "@/app/trpc";
import { Subject } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
const STATE_KEY = "subjects-data";
export function useSubjectsData(
  {
    isPreviousYear,
    termId,
  }: {
    isPreviousYear: boolean;
    termId?: string;
  } = { isPreviousYear: false, termId: undefined }
) {
  const cachedData = queryClient.getQueryData<{
    subjects: Record<string, Subject[]>;
    currentTermIndex: number;
  }>("subjects-data");
  const query = useQuery(
    trpc.myed.subjects.getSubjects.queryOptions({
      isPreviousYear,
      termId,
    })
  );
  return query;
}
