import { trpc } from "@/app/trpc";
import { getSubjectsCacheCookiePrefix } from "@/constants/core";
import {
  getCachedClientResponse,
  getReactQueryMockSuccessResponse,
} from "@/helpers/get-cached-client-response";
import { RouterOutput } from "@/lib/trpc/types";
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

  const cachedResponse = getCachedClientResponse<
    RouterOutput["myed"]["subjects"]["getSubjects"]
  >(getSubjectsCacheCookiePrefix({ isPreviousYear, termId }));

  if (query.isPending && cachedResponse)
    return getReactQueryMockSuccessResponse(query, cachedResponse);

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
