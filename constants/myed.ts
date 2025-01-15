import CallableInstance from "callable-instance";
import * as cheerio from "cheerio";

export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen";
export const MYED_HTML_TOKEN_INPUT_NAME = "org.apache.struts.taglib.html.TOKEN";

export const MYED_SESSION_COOKIE_NAME = "JSESSIONID";
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  MYED_SESSION_COOKIE_NAME,
  "deploymentId",
  "ApplicationGatewayAffinity",
  "ApplicationGatewayAffinityCORS",
];
export const MYED_DATE_FORMAT = "YYYY-MM-DD";
const getHTMLToken = ($: cheerio.CheerioAPI) =>
  $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`).first().val() as string;
export type FlatParsingRouteStep = {
  path: string;
  headers?: Record<string, string>;
} & (
  | {
      method: "GET";
      body?: never;
      contentType?: never;
      htmlToken?: never;
    }
  | {
      method: "POST";
      body: Record<string, any>;
      contentType: "application/x-www-form-urlencoded" | "form-data";
      htmlToken: string;
    }
);
type ParsingRouteParams = Record<string, any>;
type ParsingRouteStep<Params extends ParsingRouteParams> =
  | Omit<FlatParsingRouteStep, "htmlToken">
  | ((props: {
      $documents: cheerio.CheerioAPI[];
      params: Params;
    }) => Omit<FlatParsingRouteStep, "htmlToken">);

class ResolvedParsingRoute<Params extends ParsingRouteParams> {
  params: Params;
  steps: Array<ParsingRouteStep<Params>> = [];
  $documents: cheerio.CheerioAPI[];
  constructor(params: Params, steps: Array<ParsingRouteStep<Params>>) {
    this.params = params;
    this.steps = steps;
    this.$documents = [];
  }
  addDocument($document: cheerio.CheerioAPI) {
    this.$documents.push($document);
  }
  get length() {
    return this.steps.length;
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.steps.length; i++) {
      let nextStep = this.steps[i];
      if (typeof nextStep === "function") {
        nextStep = nextStep({
          $documents: this.$documents,
          params: this.params,
        });
      }
      if (nextStep.method === "POST") {
        (nextStep as FlatParsingRouteStep).htmlToken = getHTMLToken(
          this.$documents[0]
        );
      }
      yield { ...(nextStep as FlatParsingRouteStep), index: i };
    }
  }
}
type ParsingRouteStepPredicate<Params extends ParsingRouteParams> = (
  params: Params
) => boolean;
export class ParsingRoute<
  Params extends ParsingRouteParams = Record<string, never>
> extends CallableInstance<
  Params extends Record<string, never> ? [] : [Params],
  ResolvedParsingRoute<Params>
> {
  steps: Array<ParsingRouteStep<Params>>;
  predicates: Record<number, ParsingRouteStepPredicate<Params>> = {};
  constructor() {
    super("call");
    this.steps = [];
    this.predicates = {};
  }
  step(
    step: (typeof this)["steps"][number],
    predicate?: ParsingRouteStepPredicate<Params>
  ) {
    this.steps.push(step);
    if (predicate) this.predicates[this.steps.length - 1] = predicate;
    return this;
  }
  call(...[params]: [Params]) {
    const filteredSteps = this.steps.filter((_, index) => {
      const predicate = this.predicates[index];
      if (!predicate) return true;
      return predicate(params);
    });
    return new ResolvedParsingRoute(params, filteredSteps);
  }
}

export const myEdParsingRoutes = {
  //* query parameters mandatory for parsing to work

  subjects: new ParsingRoute().step({
    method: "GET",
    path: "portalClassList.do?navkey=academics.classes.list",
  }),
  subjectAssignments: new ParsingRoute<{ name?: string }>()
    .step({
      method: "GET",
      path: "portalClassList.do?navkey=academics.classes.list",
    })
    .step(({ $documents: [$], params: { name } }) => {
      const $tableContainer = $("#dataGrid");
      if ($tableContainer.length === 0) throw new Error("");

      if ($tableContainer.find(".listNoRecordsText").length > 0)
        throw new Error("");

      const foundSubject = $tableContainer
        .find(".listCell")
        .toArray()
        .find((cell) => {
          const texts = $(cell)
            .children("td")
            .toArray()
            .map((td) => $(td).text().trim());
          const actualName = texts[1];
          return actualName === name;
        });
      if (!foundSubject) throw new Error("");

      const subjectId = $(foundSubject)
        .children("td:nth-child(2)")
        .first()
        .attr("id");
      if (!subjectId) throw new Error("");
      const params = {
        userEvent: "2100",
        userParam: subjectId,
      };
      return {
        method: "POST",
        path: "portalClassList.do",
        body: params,
        contentType: "application/x-www-form-urlencoded",
      };
    })
    .step({
      method: "GET",
      path: "portalAssignmentList.do?navkey=academics.classes.list.gcd",
    }),
  schedule: new ParsingRoute<{ day?: string }>()
    .step({
      method: "GET",
      path: "studentScheduleContextList.do?navkey=myInfo.sch.list",
    })
    .step(
      ({ params: { day } }) => ({
        method: "GET",
        path: `studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=&schoolOid=&k8Mode=&viewDate=${day}&userEvent=0`,
      }),
      ({ day }) => !!day
    ),
  currentWeekday: new ParsingRoute().step({
    method: "GET",
    path: "studentScheduleContextList.do?navkey=myInfo.sch.list",
  }),

  // personalDetails: new ParsingRoute()
  //   .step({
  //     method: "GET",
  //     path: "portalStudentDetail.do?navkey=myInfo.details.detail",
  //   })
  //   .step({
  //     method: "POST",
  //     path: "portalStudentDetail.do?navkey=myInfo.details.detail",
  //     body: {
  //       userEvent: "2030",
  //       userParam: "2",
  //     },
  //     contentType: "application/x-www-form-urlencoded",
  //   }),
};
export type MyEdParsingRoutes = typeof myEdParsingRoutes;
export type MyEdParsingRoute = keyof MyEdParsingRoutes;
