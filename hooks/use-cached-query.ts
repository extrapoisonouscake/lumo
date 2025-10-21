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
export const getCacheKey = (queryKey: QueryKey) => {
  let cacheKey = `${queryKey[0] as string}`;
  const params = queryKey[1] as { input: Record<string, any> };
  if (params.input) {
    cacheKey += `-${JSON.stringify(params.input)}`;
  }
  return cacheKey;
};
export function useCachedQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  cacheDetails: {
    ttlKey?: ClientCacheTTLKey;
  } = {}
): UseQueryResult<TData, TError> {
  const { isOffline } = useNetworkStatus();
  const query = useQuery(options);
  const [cachedResponse, setCachedResponse] = useState<TData | undefined>(
    undefined
  );

  const cacheKey = getCacheKey(options.queryKey);

  // Load cached response on mount
  useEffect(() => {
    setCachedResponse(undefined);
    setIsLoaded(false);
    getCachedClientResponse<TData>(cacheKey).then((response) => {
      if (response) {
        setCachedResponse(response);
      }
    });
  }, [cacheKey]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Save new data to cache
  useEffect(() => {
    if (query.data && !isLoaded) {
      saveClientResponseToCache(cacheKey, query.data, cacheDetails.ttlKey);
      setIsLoaded(true);
    }
  }, [query.data]);

  if (cachedResponse && (query.isPending || isOffline)) {
    return getReactQueryMockSuccessResponse(
      query,
      cachedResponse
    ) as UseQueryResult<TData, TError>;
  }

  return query;
}
