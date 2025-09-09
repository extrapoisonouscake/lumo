import Cookies from "js-cookie";
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
  // if (typeof window === "undefined") return defaultValue;
  const cookies = Cookies.get();
  const value = cookies[key];
  if (!value) return defaultValue;
  const response = {
    ...defaultValue,

    ...JSON.parse(value),
  } as ResponseType;
  return response as ResponseType;
}
