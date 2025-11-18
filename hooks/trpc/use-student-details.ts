import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useCachedQuery } from "../use-cached-query";

export function useStudentDetails({ enabled }: { enabled?: boolean } = {}) {
  const query = useCachedQuery({
    ...getTRPCQueryOptions(trpc.myed.user.getStudentDetails)(),
    enabled,
  });

  return query;
}
