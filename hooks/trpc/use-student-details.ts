import { trpc } from "@/views/trpc";
import { useCachedQuery } from "../use-cached-query";

export function useStudentDetails({ enabled }: { enabled?: boolean } = {}) {
  const query = useCachedQuery({
    ...trpc.myed.user.getStudentDetails.queryOptions(),
    enabled,
  });

  return query;
}
