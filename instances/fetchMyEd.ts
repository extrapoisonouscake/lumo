import { MYED_DOMAIN } from "@/constants/myed";
type Fetch = typeof fetch;
type ResponseWithJSON<T> = Omit<Awaited<ReturnType<Fetch>>, "json"> & {
  json: () => Promise<T>;
};
export enum MyEdBaseURLs {
  ASPEN = "/aspen",
  NEW = "/app/rest",
  CUSTOM = "",
}
export const fetchMyEd = async <T>(
  url: string,
  options?: Parameters<Fetch>[1],
  baseUrl = MyEdBaseURLs.ASPEN
) => {
  const response = await fetch(`${MYED_DOMAIN}${baseUrl}${url}`, options);
  if (!response.ok) throw response;
  return response as ResponseWithJSON<T>;
};
