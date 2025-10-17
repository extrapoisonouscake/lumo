import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import { SubjectTerm } from "@/types/school";
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
export const subjectTermToGradeLabelsMap: Record<
  SubjectTerm,
  Array<
    OpenAPI200JSONResponse<"/aspen/rest/studentSchedule/{subjectOid}/gradeTerms">["terms"][number]["gradeTermId"]
  >
> = {
  [SubjectTerm.FirstSemester]: ["Q1", "Q2"],
  [SubjectTerm.SecondSemester]: ["Q3", "Q4"],
  [SubjectTerm.FullYear]: ["Q1", "Q2", "Q3", "Q4"],
  [SubjectTerm.FirstQuarter]: ["Q1"],
  [SubjectTerm.SecondQuarter]: ["Q2"],
  [SubjectTerm.ThirdQuarter]: ["Q3"],
  [SubjectTerm.FourthQuarter]: ["Q4"],
};
