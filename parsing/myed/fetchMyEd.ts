import { EndpointReturnTypes } from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
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
function isArray<T>(object: any | T[]): object is T[] {
  return Array.isArray(object);
}
export async function fetchMyEd<Endpoint extends MyEdFetchEndpoints>(
  endpoint: Endpoint,
  ...rest: MyEdEndpointsParamsAsOptional<Endpoint>
) {
  const cookieStore = new MyEdCookieStore(cookies());
  const endpointResolvedValue = getEndpointUrl(endpoint, ...rest);
  let finalResponse;
  const authCookies = getAuthCookies(cookieStore);
  if (isArray(endpointResolvedValue)) {
    let lastHTML = "";
    for (let i = 0; i < endpointResolvedValue.length; i++) {
      const endpointStepValue = endpointResolvedValue[i];
      let url;
      if (typeof endpointStepValue === "function") {
        url = endpointStepValue(lastHTML);
      } else {
        url = endpointStepValue;
      }
      const response = await sendIntermediateRequest(url, authCookies);
      console.log({ response });
      if (response === sessionExpiredIndicator) return response;
      lastHTML = await response.text();
      if (i === endpointResolvedValue.length - 1) {
        finalResponse = response;
      }
    }
  } else {
    finalResponse = await sendIntermediateRequest(
      endpointResolvedValue,
      getAuthCookies(cookieStore)
    );
    if (finalResponse === sessionExpiredIndicator) return finalResponse;
  }
  const html = await (
    finalResponse as NonNullable<typeof finalResponse>
  ).text();
  return endpointToFunction[endpoint](
    cheerio.load(html)
  ) as MyEdEndpointResponse<Endpoint>;
}
export type MyEdEndpointResponse<T extends MyEdFetchEndpoints> = Exclude<
  ReturnType<(typeof endpointToFunction)[T]>,
  null
>;
async function sendIntermediateRequest(
  endpoint: EndpointReturnTypes,
  authCookies: ReturnType<typeof getAuthCookies>
) {
  const response = await sendMyEdRequest(endpoint, authCookies);
  if (!response.ok) {
    if (response.status === 404) return sessionExpiredIndicator;
    throw response;
  }
  return response;
}
