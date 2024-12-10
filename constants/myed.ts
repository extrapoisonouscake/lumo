import { MyEdEndpoints } from "@/types/myed";
import * as cheerio from "cheerio";

export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen";
export const MYED_HTML_TOKEN_INPUT_NAME = "org.apache.struts.taglib.html.TOKEN";
type EndpointArrayResolveValue = Array<
  EndpointReturnTypes | ((html: string) => EndpointReturnTypes)
>;
export type EndpointFetchParameters = [string, Parameters<typeof fetch>[1]?];
export type EndpointReturnTypes = string | EndpointFetchParameters;
export type AllowedEndpointResolveValues = string | EndpointArrayResolveValue;
export type AllowedEndpointValues =
  | AllowedEndpointResolveValues
  | ((params: Record<string, any>) => AllowedEndpointResolveValues);
export const MYED_ENDPOINTS = {
  //* query parameters are mandatory to work
  login: "logon.do?mobile=1",
  subjects: "portalClassList.do?navkey=academics.classes.list",

  schedule: ({ day }: { day?: string }) => {
    const baseEndpoints: EndpointArrayResolveValue = [
      "studentScheduleContextList.do?navkey=myInfo.sch.list",
    ];
    if (day) {
      baseEndpoints.push(
        `studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=&schoolOid=&k8Mode=&viewDate=${day}&userEvent=0`
      );
    }
    return baseEndpoints;
  },
  currentWeekday: "studentScheduleContextList.do?navkey=myInfo.sch.list",
  logout: "logout.do",
  personalDetails: [
    "portalStudentDetail.do?navkey=myInfo.details.detail",
    (html) => {
      const $ = cheerio.load(html);
      const token = $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`)
        .first()
        .val();
      const params = new URLSearchParams({
        [MYED_HTML_TOKEN_INPUT_NAME]: `${token}`,
        userEvent: "2030",
        userParam: "2",
      });
      return [
        "portalStudentDetail.do?navkey=myInfo.details.detail",
        {
          method: "POST",
          body: params,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      ];
    },
  ],
} as const satisfies Record<string, AllowedEndpointValues>;
export type EndpointResolvedValue<T extends MyEdEndpoints> =
  T extends MyEdEndpoints
    ? (typeof MYED_ENDPOINTS)[T] extends (...args: any[]) => infer R
      ? R
      : (typeof MYED_ENDPOINTS)[T]
    : never;
export const MYED_SESSION_COOKIE_NAME = "JSESSIONID";
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  MYED_SESSION_COOKIE_NAME,
  "deploymentId",
  "ApplicationGatewayAffinity",
  "ApplicationGatewayAffinityCORS",
];
export const MYED_DATE_FORMAT = "YYYY-MM-DD";
