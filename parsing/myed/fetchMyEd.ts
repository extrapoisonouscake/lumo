import {
  MYED_SESSION_COOKIE_NAME,
  MyEdParsingRoute,
  MyEdParsingRoutes,
  myEdParsingRoutes,
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdEndpointsParamsAsOptional } from "@/types/myed";
import { paths } from "@/types/myed-rest";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { parseSubjectAssignments } from "./assignments";
import { parseCurrentWeekday, parseSchedule } from "./schedule";
import { sendMyEdRequest, SendMyEdRequestParameters } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
import { ParserFunctionArguments } from "./types";
export const ENDPOINTS = {
  ...myEdParsingRoutes,
  personalDetails: "/users/currentUser",
} satisfies Record<string, MyEdParsingRoutes[MyEdParsingRoute] | keyof paths>;
const endpointToFunction = {
  subjects: parseSubjects,
  schedule: parseSchedule,
  currentWeekday: parseCurrentWeekday,
  subjectAssignments: parseSubjectAssignments,
  personalDetails: () => {},
} satisfies {
  [K in keyof typeof ENDPOINTS]: K extends keyof paths
    ? (data: Record<string, any> | Record<string, any>[]) => any
    : (...args: ParserFunctionArguments<K>) => any;
};

export const fetchMyEd = cache(async function <
  Endpoint extends keyof typeof ENDPOINTS
>(endpoint: Endpoint, ...rest: MyEdEndpointsParamsAsOptional<Endpoint>) {
  const cookieStore = new MyEdCookieStore(cookies());

  const authCookies = getAuthCookies(cookieStore);

  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (!session) return;

  const steps = myEdParsingRoutes[endpoint](...rest);

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
  }

  return endpointToFunction[endpoint](
    rest[0],
    ...steps.$documents
  ) as MyEdEndpointResponse<Endpoint>;
});

export type MyEdEndpointResponse<T extends MyEdParsingRoute> = Exclude<
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
