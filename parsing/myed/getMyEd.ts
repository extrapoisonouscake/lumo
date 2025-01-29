import {
  ENDPOINTS,
  FlatRouteStep,
  MYED_SESSION_COOKIE_NAME,
  MyEdEndpoint,
  MyEdParsingRoute,
  MyEdRestEndpoint,
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdEndpointsParamsAsOptional } from "@/types/myed";
import * as cheerio from "cheerio";
import * as jose from "jose";
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
  [K in MyEdParsingRoute | MyEdRestEndpoint]: (
    ...args: K extends MyEdRestEndpoint
      ? any[] /*!*/
      : ParserFunctionArguments<K>
  ) => any;
};
const processResponse = async (response: Response, value: FlatRouteStep) => {
  return value.expect === "html"
    ? cheerio.load(await response.text())
    : await response.json();
};
export const getMyEd = cache(async function <Endpoint extends MyEdEndpoint>(
  endpoint: Endpoint,
  ...rest: MyEdEndpointsParamsAsOptional<Endpoint>
) {
  const cookieStore = new MyEdCookieStore();

  const authCookies = getAuthCookies(cookieStore);

  const session = cookieStore.get(MYED_SESSION_COOKIE_NAME)?.value;
  if (!session) return;
  const { payload: parsedSession } = jose.UnsecuredJWT.decode<{
    session: string;
    studentID: string;
  }>(session);

  const requestGroup = `${endpoint}-${Date.now()}`;
  //@ts-expect-error Spreading rest is intentional as endpoint functions expect tuple parameters
  const steps = ENDPOINTS[endpoint](parsedSession.studentID, ...rest); //!
  try {
    let lastRequestType: "parsing" | "rest";
    for (const step of steps) {
      const isLastRequest = step.index === steps.length - 1;
      const value = step.value;

      const response = await sendMyEdRequest({
        //@ts-expect-error FIX THIS
        step: value,
        session,
        authCookies,
        requestGroup,
        isLastRequest,
      });
      const responses = [];
      const isArray = Array.isArray(response) && Array.isArray(value);
      if (isArray) {
        for (let i = 0; i < response.length; i++) {
          const r = response[i];
          responses.push(await processResponse(r, value[i]));
        }
      } else {
        //@ts-expect-error FIX THIS
        responses.push(await processResponse(response, value as FlatRouteStep));
      }
      steps.addResponse(isArray ? responses : responses[0]);
    }
    return endpointToParsingFunction[endpoint](
      rest[0] as unknown as any,
      ...(steps.responses as any)
    ) as MyEdEndpointResponse<Endpoint>;
  } catch (e) {
    console.error(e);
    return undefined;
  }
});

export type MyEdEndpointResponse<T extends MyEdEndpoint> = Exclude<
  ReturnType<(typeof endpointToParsingFunction)[T]>,
  null
>;
