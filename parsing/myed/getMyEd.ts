import {
  ENDPOINTS,
  FlatRouteStep,
  MyEdEndpoint,
  MyEdParsingRoute,
  MyEdRestEndpoint,
} from "@/constants/myed";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { MyEdEndpointsParamsAsOptional } from "@/types/myed";
import * as cheerio from "cheerio";
import "server-only";

import { parseSubjectAssignment, parseSubjectAssignments } from "./assignments";
import { parsePersonalDetails } from "./profile";
import { parseRegistrationFields } from "./registration";
import { parseCurrentWeekday, parseSchedule } from "./schedule";
import { sendMyEdRequest } from "./sendMyEdRequest";
import {
  parseSubjectIdByName,
  parseSubjects,
  parseSubjectSummary,
} from "./subjects";
import { ParserFunctionArguments } from "./types";

const endpointToParsingFunction = {
  subjects: parseSubjects,
  schedule: parseSchedule,
  currentWeekday: parseCurrentWeekday,
  subjectAssignments: parseSubjectAssignments,
  personalDetails: parsePersonalDetails,
  registrationFields: parseRegistrationFields,
  subjectAssignment: parseSubjectAssignment,
  subjectSummary: parseSubjectSummary,
  subjectIdByName: parseSubjectIdByName,
} satisfies {
  [K in MyEdParsingRoute | MyEdRestEndpoint]: (
    args: ParserFunctionArguments<K>
  ) => any;
};
const processResponse = async (response: Response, value: FlatRouteStep) => {
  if (value.expect === "html") {
    const text = await response.text();
    return cheerio.load(text);
  } else {
    return await response.json();
  }
};
export const getMyEd = (props?: {
  authCookies: AuthCookies;
  studentId: string;
}) =>
  async function <Endpoint extends MyEdEndpoint>(
    endpoint: Endpoint,
    ...rest: MyEdEndpointsParamsAsOptional<Endpoint>
  ) {
    const route = ENDPOINTS[endpoint];

    //@ts-expect-error Spreading rest is intentional as endpoint functions expect tuple parameters
    const steps = route(props?.studentId, ...rest); //!
    for (const step of steps) {
      const value = step.value;
      const response = await sendMyEdRequest({
        // @ts-expect-error intentional
        step: value,
        authCookies: props?.authCookies,
      });
      const responses = [];
      const isArray = Array.isArray(response) && Array.isArray(value);
      if (isArray) {
        for (let i = 0; i < response.length; i++) {
          const r = response[i] as Response;
          //optimize
          const processedData = await processResponse(
            r,
            value[i] as FlatRouteStep
          );
          if (!processedData) throw new Error("No processed data");
          responses.push(processedData);
        }
      } else {
        const processedData = await processResponse(
          //@ts-expect-error jic
          response,

          value as FlatRouteStep
        );
        if (!processedData) throw new Error("No processed data");
        responses.push(processedData);
      }
      steps.addResponse(isArray ? responses : responses[0]);
    }

    return endpointToParsingFunction[endpoint]({
      params: rest[0] as unknown as any,
      responses: steps.responses as any,
      metadata: steps.metadata,
    }) as MyEdEndpointResponse<Endpoint>;
  };

export type MyEdEndpointResponse<T extends MyEdEndpoint> = Exclude<
  ReturnType<(typeof endpointToParsingFunction)[T]>,
  null
>;
