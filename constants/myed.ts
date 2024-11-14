export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen";
export const MYED_ENDPOINTS = {
  //* query parameters are mandatory to work
  login: "logon.do",
  subjects: "portalClassList.do?navkey=academics.classes.list",
  schedule: "studentScheduleContextList.do?navkey=myInfo.sch.list",
  currentWeekday: "studentScheduleContextList.do?navkey=myInfo.sch.list",
  logout: "logout.do",
} as const;
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  "JSESSIONID",
  "deploymentId",
  "ApplicationGatewayAffinity",
  "ApplicationGatewayAffinityCORS",
];
