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
  const cookieStore = new MyEdCookieStore();

  const authCookies = getAuthCookies(cookieStore);

  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (!session) return;
  const { payload: parsedSession } = jose.UnsecuredJWT.decode<{ session: string, studentID: string }>(session)
  
  const requestGroup = `${endpoint}-${Date.now()}`;
  try{if (isRestEndpoint(endpoint)) {
    const steps = myEdRestEndpoints[endpoint]({ params: rest[0], studentID: parsedSession.studentID });
    const stepsArray = Array.isArray(steps) ? steps : [steps]
    const responses = await sendMyEdRequest({ step: stepsArray, authCookies, session, isRestRequest: true, requestGroup, isLastRequest: true }).then(response => Promise.all(response.map(r => r.json())))
    return endpointToParsingFunction[endpoint](
      rest[0] as any,
      //@ts-expect-error Spreading responses is intentional as endpoint functions expect tuple parameters
      ...responses
    ) as MyEdEndpointResponse<Endpoint>;
  }
  type NarrowedRoute = NarrowedParsingRoute<Endpoint>
  const steps = ENDPOINTS[endpoint as NarrowedRoute](...rest as any);//!

  for (const step of steps) {
    const isLastRequest = step.index === steps.length - 1;

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
    //@ts-expect-error Spreading responses is intentional as endpoint functions expect tuple parameters
    ...steps.$documents
  ) as MyEdEndpointResponse<Endpoint>;}catch(e){
    console.error(e)
    return undefined
  }
});

export type MyEdEndpointResponse<T extends MyEdEndpoint> = Exclude<
  ReturnType<(typeof endpointToParsingFunction)[T]>,
  null
>;

