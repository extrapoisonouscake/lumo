import { MYED_ROOT_URL } from "@/constants/myed";
type Fetch = typeof fetch;
type ResponseWithJSON<T> = Omit<Awaited<ReturnType<Fetch>>, "json"> & {
  json: () => Promise<T>;
};
export const fetchMyEd = async <T>(
  url: string,
  options?: Parameters<Fetch>[1],
  baseUrl = MYED_ROOT_URL
) => {
  const response = await fetch(`${baseUrl}${url}`, options);
  if (!response.ok) throw response;
  return response as ResponseWithJSON<T>;
};
