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
export function useSubjectData({
  id,
  ...rest
}: { id: string } & Parameters<typeof useSubjectsData>[0]) {
  const query = useSubjectsData(rest);
  const subject = query.data?.subjects.main.find((s) => s.id === id);
  return { ...query, data: subject };
}
