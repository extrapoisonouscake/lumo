export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen";
export const MYED_ENDPOINTS = {
  //* query parameters are mandatory to work
  login: "logon.do",
  subjects: "portalClassList.do?navkey=academics.classes.list",

  schedule: ({ day }: { day?: string }) => {
    return `${
      day ? "studentScheduleMatrix" : "studentScheduleContextList"
    }.do?navkey=myInfo.sch.list${
      day
        ? `&termOid=date&schoolOid=&k8Mode=&viewDate=${day}&userEvent=2000`
        : ""
    }`;
  },
  currentWeekday: "studentScheduleContextList.do?navkey=myInfo.sch.list",
  logout: "logout.do",
} as const;
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  "JSESSIONID",
  "deploymentId",
  "ApplicationGatewayAffinity",
  "ApplicationGatewayAffinityCORS",
];
export const MYED_DATE_FORMAT = "DD/MM/YYYY";
