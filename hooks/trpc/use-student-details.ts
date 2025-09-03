import { trpc } from "@/app/trpc";
import { USER_CACHE_COOKIE_PREFIX } from "@/constants/core";
import { getCachedClientResponse } from "@/helpers/get-cached-client-response";
import { PersonalDetails } from "@/types/school";
import { useQuery } from "@tanstack/react-query";

export function useStudentDetails({ enabled }: { enabled?: boolean } = {}) {
  const query = useQuery({
    ...trpc.myed.user.getStudentDetails.queryOptions(),
    enabled,
  });
  const cachedResponse = getCachedClientResponse<PersonalDetails>(
    USER_CACHE_COOKIE_PREFIX
  );

  if (query.isPending && cachedResponse)
    return {
      ...query,
      status: "success",
      isPending: false,
      isLoading: false,
      data: cachedResponse,
    };
  return query;
}
