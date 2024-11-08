export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen";
export const MYED_ENDPOINTS = {
  login: "logon.do",
  subjects: "portalClassList.do",
  logout: "logout.do",
} as const;
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  "JSESSIONID",
  "deploymentId",
  "ApplicationGatewayAffinity",
  "ApplicationGatewayAffinityCORS",
];
