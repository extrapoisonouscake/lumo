import {
  MYED_ROUTES,
  MYED_SESSION_COOKIE_NAME,
  MyEdParsingRoute,
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import {
  MyEdEndpointsParamsAsOptional,
  MyEdEndpointsParamsWithUserID,
} from "@/types/myed";
import * as cheerio from "cheerio";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { parseSubjectAssignments } from "./assignments";
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
  subjectAssignments: parseSubjectAssignments,
} as const satisfies {
  [K in MyEdParsingRoute]: (...args: ParserFunctionArguments<K>) => any;
};

export const sessionExpiredIndicator: unique symbol = Symbol();
//* the original website appears to be using the server to store user navigation
// * to get to some pages, an additional request has to be sent OR follow redirects

export const fetchMyEd = cache(async function <
  Endpoint extends MyEdParsingRoute
>(endpoint: Endpoint, ...rest: MyEdEndpointsParamsAsOptional<Endpoint>) {
  const cookieStore = new MyEdCookieStore(cookies());
  let finalResponse;
  const authCookies = getAuthCookies(cookieStore);

  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (!session) return;
  const userID = decodeJwt(session).userID as string;
  const restWithUserID = [
    { userID, ...rest[0] },
  ] as MyEdEndpointsParamsWithUserID<Endpoint>; //?!
  const steps = MYED_ROUTES[endpoint](...restWithUserID);

  const requestGroup = `${endpoint}-${Date.now()}`;
  for (const step of steps) {
    const isLastRequest = step.index === steps.length - 1;
    const response = await sendIntermediateRequest({
      step,
      session,
      authCookies,
      requestGroup,
      isLastRequest,
    });

    steps.addDocument(cheerio.load(await response.text()));
    if (isLastRequest) {
      finalResponse = response;
    }
  }

  return endpointToFunction[endpoint](
    rest[0],
    ...steps.$documents
  ) as MyEdEndpointResponse<Endpoint>;
});

type MyEdEndpointResponse<T extends MyEdParsingRoute> = Exclude<
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
