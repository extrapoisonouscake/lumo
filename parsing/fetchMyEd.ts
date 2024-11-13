import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdFetchEndpoints } from "@/types/myed";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import { cookies } from "next/headers";
import "server-only";
import { parseSchedule } from "./schedule";
import { sendMyEdRequest } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
const endpointToFunction = {
  subjects: parseSubjects,
  schedule: parseSchedule,
} as const satisfies Record<MyEdFetchEndpoints, (dom: CheerioAPI) => any>;
export const sessionExpiredIndicator: unique symbol = Symbol();
//* the original website appears to be using the server to store user navigation
// * to get to some pages, an additional request has to be sent OR follow redirects
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
  return endpointToFunction[endpoint](cheerio.load(html));
}
export type MyEdEndpointResponse<T extends MyEdFetchEndpoints> = Exclude<
  ReturnType<(typeof endpointToFunction)[T]>,
  null
>;
