import {
  EndpointFetchParameters,
  MYED_SESSION_COOKIE_NAME,
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { getEndpointUrl } from "@/helpers/getEndpointUrl";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import {
  MyEdEndpointsParamsAsOptional,
  MyEdEndpointsParamsWithUserID,
  MyEdFetchEndpoints,
} from "@/types/myed";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { getFullUrl } from "../../helpers/getEndpointUrl";
import { parsePersonalDetails } from "./profile";
import { parseCurrentWeekday, parseSchedule } from "./schedule";
import { sendMyEdRequest, SendMyEdRequestParameters } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
import { ParserFunctionArguments } from "./types";
const endpointToFunction = {
  subjects: parseSubjects,
  schedule: parseSchedule,
  currentWeekday: parseCurrentWeekday,
  personalDetails: parsePersonalDetails,
} as const satisfies {
  [K in MyEdFetchEndpoints]: (...args: ParserFunctionArguments<K>) => any;
};
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
  let finalResponse;
  const authCookies = getAuthCookies(cookieStore);
  const htmlStrings: string[] = [];
  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (!session) return;
  const userID = decodeJwt(session).userID as string;
  const restWithUserID = [
    { userID, ...(rest[0] || {}) },
  ] as MyEdEndpointsParamsWithUserID<Endpoint>; //?!
  const endpointResolvedValue = getEndpointUrl(endpoint, ...restWithUserID);
  if (isArray(endpointResolvedValue)) {
    const requestGroup = `${endpoint}-${Date.now()}`;
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
      const isLastRequest = i === endpointResolvedValue.length - 1;
      const response = await sendIntermediateRequest({
        urlOrParams: url,
        session,
        authCookies,
        requestGroup,
        isLastRequest,
      });

      htmlStrings.push(await response.text());
      if (isLastRequest) {
        finalResponse = response;
      }
    }
  } else {
    finalResponse = await sendIntermediateRequest({
      urlOrParams: endpointResolvedValue,
      session,
      authCookies: getAuthCookies(cookieStore),
    });
    htmlStrings.push(await finalResponse.text());
  }
  const domObjects = htmlStrings.map((html) =>
    cheerio.load(html)
  ) as Array<CheerioAPI>;
  console.log(endpoint, { d: rest });
  return endpointToFunction[endpoint](
    rest[0],
    ...domObjects
  ) as MyEdEndpointResponse<Endpoint>;
});
export type MyEdEndpointResponse<T extends MyEdFetchEndpoints> = Exclude<
  ReturnType<(typeof endpointToFunction)[T]>,
  null
>;
async function sendIntermediateRequest(props: SendMyEdRequestParameters) {
  const response = await sendMyEdRequest(props);
  if (!response.ok) {
    throw response;
  }
  return response;
}
