import {
  ENDPOINTS,
  MYED_SESSION_COOKIE_NAME,
  MyEdEndpoint,
  MyEdParsingRoute,
  MyEdRestEndpoint,
  myEdRestEndpoints,
  ResolvedMyEdRestEndpoint
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdEndpointsParamsAsOptional } from "@/types/myed";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { parseSubjectAssignments } from "./assignments";
import { parsePersonalDetails } from "./profile";
import { parseCurrentWeekday, parseSchedule } from "./schedule";
import { sendMyEdRequest } from "./sendMyEdRequest";
import { parseSubjects } from "./subjects";
import { ParserFunctionArguments } from "./types";

const endpointToParsingFunction = {
  subjects: parseSubjects,
  schedule: parseSchedule,
  currentWeekday: parseCurrentWeekday,
  subjectAssignments: parseSubjectAssignments,
  personalDetails: parsePersonalDetails,
  test: (e: any, ...p: any[]) => { }
} satisfies {
  [K in MyEdParsingRoute | MyEdRestEndpoint]: (...args: K extends MyEdRestEndpoint ? ResolvedMyEdRestEndpoint<K> extends any[] ? [params: Record<string, any> | undefined, ...ResolvedMyEdRestEndpoint<K>] : [params: Record<string, any> | undefined, ResolvedMyEdRestEndpoint<K>] : ParserFunctionArguments<K>) => any
};
const isRestEndpoint = (endpoint: MyEdEndpoint): endpoint is MyEdRestEndpoint => {
  return endpoint in myEdRestEndpoints;
};
type NarrowedParsingRoute<Endpoint extends MyEdEndpoint> = Exclude<Endpoint, MyEdRestEndpoint>
export const fetchMyEd = cache(async function <
  Endpoint extends MyEdEndpoint
>(endpoint: Endpoint, ...rest: MyEdEndpointsParamsAsOptional<Endpoint>) {
  const cookieStore = new MyEdCookieStore(cookies());

  const authCookies = getAuthCookies(cookieStore);

  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (!session) return;
  if (isRestEndpoint(endpoint)) {
    const steps = myEdRestEndpoints[endpoint](...rest as MyEdEndpointsParamsAsOptional<MyEdRestEndpoint>);
    const stepsArray = Array.isArray(steps) ? steps : [steps]
    const responses = await Promise.all(stepsArray.map(step => sendMyEdRequest({ step, authCookies }).then(response => response.json())))
    return endpointToParsingFunction[endpoint](
      rest[0],
      ...responses
    ) as MyEdEndpointResponse<Endpoint>;
  }
  type NarrowedRoute = NarrowedParsingRoute<Endpoint>
  const steps = ENDPOINTS[endpoint as NarrowedRoute](...rest as any);//!

  const requestGroup = `${endpoint}-${Date.now()}`;
  for (const step of steps) {
    const isLastRequest = step.index === steps.length - 1;
    const response = await sendMyEdRequest({
      step,
      session,
      authCookies,
      requestGroup,
      isLastRequest,
    });

    steps.addDocument(cheerio.load(await response.text()));
  }

  return endpointToParsingFunction[endpoint](
    rest[0] ?? {},
    ...steps.$documents
  ) as MyEdEndpointResponse<Endpoint>;
});

export type MyEdEndpointResponse<T extends MyEdEndpoint> = Exclude<
  ReturnType<(typeof endpointToParsingFunction)[T]>,
  null
>;

