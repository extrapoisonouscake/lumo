import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdFetchEndpoints } from "@/types/myed";
import { cookies } from "next/headers";
import "server-only";
import { sendMyEdRequest } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
const endpointToFunction = {
  subjects: parseSubjects,
} as const satisfies Record<MyEdFetchEndpoints, (html: string) => any>;
export const sessionExpiredIndicator: unique symbol = Symbol();

export function isSessionExpiredResponse(
  response: any
): response is typeof sessionExpiredIndicator {
  return true;
}
export async function fetchMyEd(endpoint: MyEdFetchEndpoints) {
  const cookieStore = new MyEdCookieStore(cookies());
  let response = await sendMyEdRequest(endpoint, getAuthCookies(cookieStore));
  if (!response.ok) {
    if (response.status === 404) return sessionExpiredIndicator;
    throw response;
  }
  const html = await response.text();
  return endpointToFunction[endpoint](html);
}
export type MyEdEndpointResponse<T extends MyEdFetchEndpoints> = Exclude<
  ReturnType<(typeof endpointToFunction)[T]>,
  null
>;
