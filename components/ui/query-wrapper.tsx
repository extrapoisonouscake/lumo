import { QueryObserverResult } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ErrorCard } from "../misc/error-card";

interface QueryWrapperProps<TData, TError> {
  query: QueryObserverResult<TData, TError>;
  children: (data: TData) => ReactNode;
  skeleton?: ReactNode;
  onError?: ReactNode;
}

export function QueryWrapper<TData, TError>({
  query,
  children,
  skeleton,
  onError,
}: QueryWrapperProps<TData, TError>) {
  if (query.isLoading && skeleton) {
    return <>{skeleton}</>;
  }

  if (query.isError) {
    return <>{onError || <ErrorCard />}</>;
  }

  if (query.data) {
    return <>{children(query.data)}</>;
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
