import { QueryObserverResult } from "@tanstack/react-query";
const TTL_MAP = {
  schedule: 1000 * 60 * 60 * 24,
} as const;

export type ClientCacheTTLKey = keyof typeof TTL_MAP;
export function getCachedClientResponse<ResponseType>(
  key: string,
  defaultValue?: never
): ResponseType | undefined;
export function getCachedClientResponse<ResponseType>(
  key: string,
  defaultValue: any
): ResponseType;

export function getCachedClientResponse<ResponseType>(
  key: string,
  defaultValue?: any
) {
  const value = storage.get<ResponseType>(key);
  if (!value) return defaultValue;
  const response = {
    ...defaultValue,
    ...value,
  } as ResponseType;
  return response as ResponseType;
}
export function saveClientResponseToCache<ResponseType>(
  key: string,
  value: ResponseType,
  ttlKey?: string
) {
  storage.set(key, value, TTL_MAP[ttlKey as ClientCacheTTLKey]);
}
export function getReactQueryMockSuccessResponse<ResponseType, ErrorShape>(
  query: QueryObserverResult<ResponseType, ErrorShape>,
  data: ResponseType
) {
  return {
    ...query,
    status: "success",
    isPending: false,
    isLoading: false,
    data: data,
  };
}
export const storage = {
  get: function <T>(key: string) {
    const item = localStorage.getItem(key);
    if (!item) return undefined;
    const { value, expiresAt } = JSON.parse(item) as {
      value: T;
      expiresAt: number;
    };
    if (expiresAt && Date.now() > expiresAt) {
      storage.delete(key);
      return undefined;
    }
    return value;
  },
  set: (key: string, value: any, ttl: number) =>
    localStorage.setItem(
      key,
      JSON.stringify({ value, expiresAt: Date.now() + ttl })
    ),
  delete: (key: string) => localStorage.removeItem(key),
};
