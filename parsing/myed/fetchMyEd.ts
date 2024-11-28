import { EndpointFetchParameters, EndpointReturnTypes } from "@/constants/myed";
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
import { cache } from "react";
import "server-only";
import { getFullUrl } from "../../helpers/getEndpointUrl";
import { parsePersonalDetails } from "./profile";
import { parseCurrentWeekday, parseSchedule } from "./schedule";
import { sendMyEdRequest } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
import { ParserFunctionArguments } from "./types";
const endpointToFunction = {
  subjects: parseSubjects,
  schedule: parseSchedule,
  currentWeekday: parseCurrentWeekday,
  personalDetails: parsePersonalDetails,
} as const satisfies Record<
  MyEdFetchEndpoints,
  (...args: ParserFunctionArguments) => any
>;
export const sessionExpiredIndicator: unique symbol = Symbol();
//* the original website appears to be using the server to store user navigation
// * to get to some pages, an additional request has to be sent OR follow redirects

function isArray<T>(object: any | T[]): object is T[] {
  return Array.isArray(object);
}
export const fetchMyEd = cache(async function <
  Endpoint extends MyEdFetchEndpoints
>(endpoint: Endpoint, ...rest: MyEdEndpointsParamsAsOptional<Endpoint>) {
  const cookieStore = new MyEdCookieStore(cookies());
  const endpointResolvedValue = getEndpointUrl(endpoint, ...rest);
  let finalResponse;
  const authCookies = getAuthCookies(cookieStore);
  const htmlStrings: string[] = [];
  if (isArray(endpointResolvedValue)) {
    for (let i = 0; i < endpointResolvedValue.length; i++) {
      const endpointStepValue = endpointResolvedValue[i];
      let url;
      if (typeof endpointStepValue === "function") {
        const rawUrlParams = endpointStepValue(htmlStrings[i - 1]);
        if (Array.isArray(rawUrlParams)) {
          url = [
            getFullUrl(rawUrlParams[0]),
            rawUrlParams[1],
          ] as EndpointFetchParameters;
        } else {
          url = rawUrlParams;
        }
      } else {
        url = endpointStepValue;
      }
      const response = await sendIntermediateRequest(url, authCookies);

      if (response === sessionExpiredIndicator) return response;
      htmlStrings.push(await response.text());
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
    htmlStrings.push(await finalResponse.text());
  }
  const domObjects = htmlStrings.map((html) =>
    cheerio.load(html)
  ) as Array<CheerioAPI>;
  return endpointToFunction[endpoint](
    ...domObjects
  ) as MyEdEndpointResponse<Endpoint>;
});
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
