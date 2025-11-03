import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useCachedQuery } from "../use-cached-query";

export function usePersonalDetails() {
  const query = useCachedQuery(
    getTRPCQueryOptions(trpc.myed.user.getPersonalDetails)()
  );

  return query;
}
