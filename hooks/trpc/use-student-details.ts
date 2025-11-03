import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import * as Sentry from "@sentry/capacitor";
import { useEffect } from "react";
import { useCachedQuery } from "../use-cached-query";

export function useStudentDetails({ enabled }: { enabled?: boolean } = {}) {
  const query = useCachedQuery({
    ...getTRPCQueryOptions(trpc.myed.user.getStudentDetails)(),
    enabled,
  });
  useEffect(() => {
    if (query.data) {
      Sentry.setUser({
        username: query.data.studentNumber,
      });
    }
  }, [query.data]);
  return query;
}
