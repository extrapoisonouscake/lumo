import {
  ENDPOINTS,
  MYED_SESSION_COOKIE_NAME,
  MyEdEndpoint,
  MyEdParsingRoute,
  MyEdRestEndpoint,
  myEdRestEndpoints
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdEndpointsParamsAsOptional } from "@/types/myed";
import * as cheerio from "cheerio";
import * as jose from 'jose';
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
} satisfies {
  [K in MyEdParsingRoute | MyEdRestEndpoint]: (...args: K extends MyEdRestEndpoint ? any[]/*!*/ : ParserFunctionArguments<K>) => any
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
  const { payload: parsedSession } = jose.UnsecuredJWT.decode<{ session: string, studentID: string }>(session)
  if (isRestEndpoint(endpoint)) {
    console.log("rest")
    const steps = myEdRestEndpoints[endpoint]({ params: rest[0], studentID: parsedSession.studentID });
    const stepsArray = Array.isArray(steps) ? steps : [steps]
    console.log({ stepsArray })
    const responses = await Promise.all(stepsArray.map(step => sendMyEdRequest({ step, authCookies, isRestRequest: true }).then(response => response.json())))
    console.log({ responses: responses[0] })
    return endpointToParsingFunction[endpoint](
      rest[0] as any,
      ...responses
    ) as MyEdEndpointResponse<Endpoint>;
  }
  type NarrowedRoute = NarrowedParsingRoute<Endpoint>
  const steps = ENDPOINTS[endpoint as NarrowedRoute](...rest as any);//!

  const requestGroup = `${endpoint}-${Date.now()}`;
  for (const step of steps) {
    const isLastRequest = step.index === steps.length - 1;

    console.log(requestGroup)
    const response = await sendMyEdRequest({
      step,
      session,
      authCookies,
      isRestRequest: false,
      requestGroup,
      isLastRequest,
    });

    steps.addDocument(cheerio.load(await response.text()));
  }

  return endpointToParsingFunction[endpoint](
    rest[0] as any,
    ...steps.$documents
  ) as MyEdEndpointResponse<Endpoint>;
});

export type MyEdEndpointResponse<T extends MyEdEndpoint> = Exclude<
  ReturnType<(typeof endpointToParsingFunction)[T]>,
  null
>;

