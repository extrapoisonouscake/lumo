import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import {
  MyEdEndpointsParamsAsOptional,
  MyEdFetchEndpoints,
} from "@/types/myed";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import { cookies } from "next/headers";
import "server-only";
import { parseCurrentWeekday, parseSchedule } from "./schedule";
import { sendMyEdRequest } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
const endpointToFunction = {
  subjects: parseSubjects,
  schedule: parseSchedule,
  currentWeekday: parseCurrentWeekday,
} as const satisfies Record<MyEdFetchEndpoints, (dom: CheerioAPI) => any>;
export const sessionExpiredIndicator: unique symbol = Symbol();
//* the original website appears to be using the server to store user navigation
// * to get to some pages, an additional request has to be sent OR follow redirects
export function isSessionExpiredResponse(
  response: any
): response is typeof sessionExpiredIndicator {
  return true;
}

export async function fetchMyEd<Endpoint extends MyEdFetchEndpoints>(
  endpoint: Endpoint,
  ...rest: MyEdEndpointsParamsAsOptional<Endpoint>
) {
  const cookieStore = new MyEdCookieStore(cookies());
  let response = await sendMyEdRequest(
    endpoint,
    getAuthCookies(cookieStore),
    ...rest
  );
  if (!response.ok) {
    if (response.status === 404) return sessionExpiredIndicator;
    throw response;
  }
  const html = await response.text();
  return endpointToFunction[endpoint](
    cheerio.load(html)
  ) as MyEdEndpointResponse<Endpoint>;
}
export type MyEdEndpointResponse<T extends MyEdFetchEndpoints> = Exclude<
  ReturnType<(typeof endpointToFunction)[T]>,
  null
>;
