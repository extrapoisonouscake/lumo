import { MyEdEndpoints } from "@/types/myed";

export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen";
export const MYED_HTML_TOKEN_INPUT_NAME = "org.apache.struts.taglib.html.TOKEN";
type EndpointArrayResolveValue = Array<
  string | ((html: string) => Parameters<typeof fetch>)
>;
export type EndpointReturnTypes = string | Parameters<typeof fetch>;
export type AllowedEndpointResolveValues = string | EndpointArrayResolveValue;
export type AllowedEndpointValues =
  | AllowedEndpointResolveValues
  | ((params: Record<string, any>) => AllowedEndpointResolveValues);
export const MYED_ENDPOINTS = {
  //* query parameters are mandatory to work
  login: "logon.do",
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
} as const satisfies Record<string, AllowedEndpointValues>;
export type EndpointResolvedValue<T extends MyEdEndpoints> =
  T extends MyEdEndpoints
    ? (typeof MYED_ENDPOINTS)[T] extends (...args: any[]) => infer R
      ? R
      : (typeof MYED_ENDPOINTS)[T]
    : never;
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  "JSESSIONID",
  "deploymentId",
  "ApplicationGatewayAffinity",
  "ApplicationGatewayAffinityCORS",
];
export const MYED_DATE_FORMAT = "MM/DD/YYYY";
