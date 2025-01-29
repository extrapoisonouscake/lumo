import { MYED_ROOT_URL } from "@/constants/myed";
type Fetch = typeof fetch;
type ResponseWithJSON<T> = Omit<Awaited<ReturnType<Fetch>>, "json"> & {
  json: () => Promise<T>;
};
export const fetchMyEd = async <T>(
  url: string,
  options?: Parameters<Fetch>[1]
) => {
  if (url.startsWith("/")) throw new Error("Url must not start with /");
  const response = await fetch(new URL(url, MYED_ROOT_URL), options);
  if (!response.ok) throw response;
  return response as ResponseWithJSON<T>;
};
