import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import * as Sentry from "@sentry/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCachedQuery } from "../use-cached-query";

export function useStudentDetails({ enabled }: { enabled?: boolean } = {}) {
  const query = useCachedQuery({
    ...getTRPCQueryOptions(trpc.myed.user.getStudentDetails)(),
    enabled,
  });
  const q = useQuery(trpc.myed.user.unsafe_getCredentials.queryOptions());
  useEffect(() => {
    if (query.data && q.data) {
      Sentry.setUser({
        username: query.data.studentNumber,
        tokenized: q.data.credentials,
      });
    }
  }, [query.data, q.data]);
  return query;
}
