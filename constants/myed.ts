import * as cheerio from "cheerio";

export const MYED_DOMAIN = "https://myeducation.gov.bc.ca";
export const MYED_HTML_TOKEN_INPUT_NAME = "org.apache.struts.taglib.html.TOKEN";
export const MYED_ALL_GRADE_TERMS_SELECTOR = "all";
export const MYED_SESSION_COOKIE_NAME = "JSESSIONID";
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  MYED_SESSION_COOKIE_NAME,
  "ApplicationGatewayAffinityCORS",
  "ApplicationGatewayAffinity",
] as const;
export type MyEdAuthenticationCookiesName =
  (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number];
export const MYED_DATE_FORMAT = "YYYY-MM-DD";
export const parseHTMLToken = ($: cheerio.CheerioAPI) =>
  $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`).first().val() as string;
