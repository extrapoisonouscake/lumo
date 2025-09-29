import {
  ClientCacheTTLKey,
  getCachedClientResponse,
  getReactQueryMockSuccessResponse,
  saveClientResponseToCache,
} from "@/helpers/cache";
import {
  DefaultError,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";

export function useCachedQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  cacheDetails: {
    params?: Record<string, any>;
    ttlKey?: ClientCacheTTLKey;
  } = {}
): UseQueryResult<TData, TError> {
  const query = useQuery(options);
  let cacheKey = `${options.queryKey[0] as string}`;
  if (cacheDetails.params) {
    cacheKey += `-${JSON.stringify(cacheDetails.params)}`;
  }
  useEffect(() => {
    if (query.data) {
      saveClientResponseToCache(cacheKey, query.data, cacheDetails.ttlKey);
    }
  }, [query.data]);
  const cachedResponse = getCachedClientResponse<TData>(cacheKey);
  if (query.isPending && cachedResponse)
    return getReactQueryMockSuccessResponse(
      query,
      cachedResponse
    ) as UseQueryResult<TData, TError>;
  return query;
}
