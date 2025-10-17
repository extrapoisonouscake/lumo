import { QueryObserverResult } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ErrorCard } from "../misc/error-card";
import { useNetworkStatus } from "../providers/network-status-provider";

interface QueryWrapperProps<TData, TError> {
  query: Pick<
    QueryObserverResult<TData, TError>,
    "isFetching" | "isError" | "data" | "isPaused"
  >;
  children: (data: TData) => ReactNode;
  skeleton?: ReactNode;
  onError?: ReactNode;
}
const OfflineError = () => {
  return <ErrorCard message="You are offline." emoji="🔌" />;
};
export function QueryWrapper<TData, TError>({
  query,
  children,
  skeleton,
  onError,
}: QueryWrapperProps<TData, TError>) {
  const { isOffline } = useNetworkStatus();
  if (query.isFetching) {
    return <>{skeleton}</>;
  }

  if (query.isError) {
    if (isOffline) {
      return <OfflineError />;
    }
    return <>{onError || <ErrorCard />}</>;
  }

  if (query.data) {
    return <>{children(query.data)}</>;
  }
  if (query.isPaused) {
    return <OfflineError />;
  }
  return null;
}

interface MultiQueryWrapperProps<TQueries extends readonly unknown[], TError> {
  queries: { [K in keyof TQueries]: QueryObserverResult<TQueries[K], TError> };
  children: (data: TQueries) => ReactNode;
  skeleton?: ReactNode;
  onError?: ReactNode;
}

export function MultiQueryWrapper<TQueries extends readonly unknown[], TError>({
  queries,
  children,
  skeleton,
  onError,
}: MultiQueryWrapperProps<TQueries, TError>) {
  if (queries.some((q) => q.isLoading) && skeleton) {
    return <>{skeleton}</>;
  }

  const firstError = queries.find((q) => q.isError);
  if (firstError && onError) {
    return <>{onError}</>;
  }

  const data = queries.map((q) => q.data) as unknown as TQueries;
  return <>{children(data)}</>;
}
