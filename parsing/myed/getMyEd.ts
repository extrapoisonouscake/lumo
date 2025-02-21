import {
  ENDPOINTS,
  FlatRouteStep,
  MyEdEndpoint,
  MyEdParsingRoute,
  MyEdRestEndpoint,
} from "@/constants/myed";
import { getAuthCookies } from "@/helpers/getAuthCookies";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { MyEdEndpointsParamsAsOptional } from "@/types/myed";
import * as cheerio from "cheerio";
import { cache } from "react";
import "server-only";
import { parseSubjectAssignments } from "./assignments";
import { parsePersonalDetails } from "./profile";
import { parseRegistrationFields } from "./registration";
import { clientQueueManager } from "./requests-queue";
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
  registrationFields: parseRegistrationFields,
} satisfies {
  [K in MyEdParsingRoute | MyEdRestEndpoint]: (
    args: ParserFunctionArguments<K>
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
  const route = ENDPOINTS[endpoint];
  let authParameters, studentId;
  if (route.requiresAuth) {
    const cookieStore = new MyEdCookieStore();

    const authCookies = getAuthCookies(cookieStore);
    studentId = cookieStore.get("studentId")?.value;
    const session = authCookies.JSESSIONID;
    if (!session || !studentId) return;
    const requestGroup = `${endpoint}-${Date.now()}`;
    const queue = clientQueueManager.getQueue(session);
    authParameters = { queue, authCookies, requestGroup };
  }

  //@ts-expect-error Spreading rest is intentional as endpoint functions expect tuple parameters
  const steps = route(studentId, ...rest); //!
  try {
    for (const step of steps) {
      const isLastRequest = step.index === steps.length - 1;
      const value = step.value;

      const response = await sendMyEdRequest({
        //@ts-expect-error FIX THIS
        step: value,

        isLastRequest,
        ...authParameters,
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
    return endpointToParsingFunction[endpoint]({
      params: rest[0] as unknown as any,
      responses: steps.responses as any,
      metadata: steps.metadata,
    }) as MyEdEndpointResponse<Endpoint>;
  } catch (e) {
    authParameters?.queue?.ensureUnlock();
    console.error(e);
    return undefined;
  }
});

export type MyEdEndpointResponse<T extends MyEdEndpoint> = Exclude<
  ReturnType<(typeof endpointToParsingFunction)[T]>,
  null
>;
