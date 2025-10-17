import { useNetworkStatus } from "@/components/providers/network-status-provider";
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
import { useEffect, useState } from "react";

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
  const { isOffline } = useNetworkStatus();
  const query = useQuery(options);
  const [cachedResponse, setCachedResponse] = useState<TData | undefined>(
    undefined
  );

  let cacheKey = `${options.queryKey[0] as string}`;
  if (cacheDetails.params) {
    cacheKey += `-${JSON.stringify(cacheDetails.params)}`;
  }

  // Load cached response on mount
  useEffect(() => {
    getCachedClientResponse<TData>(cacheKey).then((response) => {
      if (response) {
        setCachedResponse(response);
      }
    });
  }, [cacheKey]);

  // Save new data to cache
  useEffect(() => {
    if (query.data) {
      saveClientResponseToCache(cacheKey, query.data, cacheDetails.ttlKey);
    }
  }, [query.data, cacheKey, cacheDetails.ttlKey]);

  if (cachedResponse && (query.isPending || isOffline)) {
    return getReactQueryMockSuccessResponse(
      query,
      cachedResponse
    ) as UseQueryResult<TData, TError>;
  }

  return query;
}
