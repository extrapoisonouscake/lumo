import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useCachedQuery } from "../use-cached-query";
export function useSubjectsData(
  {
    isPreviousYear,
    termId,
  }: {
    isPreviousYear: boolean;
    termId?: string;
  } = { isPreviousYear: false, termId: undefined }
) {
  const params = {
    isPreviousYear,
    termId,
  };
  const query = useCachedQuery(
    getTRPCQueryOptions(trpc.myed.subjects.getSubjects)(params),
    {
      params,
    }
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
