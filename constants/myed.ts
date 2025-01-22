import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import { paths } from "@/types/myed-rest";
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

export type FlatRouteStep = {
  path: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  expect: "json" | "html";
} & (
  | {
      method: "GET";
      contentType?: never;
      htmlToken?: never;
    }
  | {
      method: "POST";
      contentType:
        | "application/x-www-form-urlencoded"
        | "form-data"
        | "applicatiob/json";
      htmlToken: string;
    }
);
type RouteParams = Record<string, any>;
type RouteResponse =
  | cheerio.CheerioAPI
  | Record<string, any>
  | Record<string, any>[];
type RouteStep<Params extends RouteParams> =
  | Omit<FlatRouteStep, "htmlToken">
  | Omit<FlatRouteStep, "htmlToken">[]
  | ((props: {
      responses: RouteResponse[];
      params: Params;
      studentID: string;
    }) =>
      | Omit<FlatRouteStep, "htmlToken">
      | Omit<FlatRouteStep, "htmlToken">[]);

const processStep = <Params extends RouteParams>(
  self: ResolvedRoute<Params>,
  step: Omit<FlatRouteStep, "htmlToken">
) => {
  if (step.method === "POST") {
    const htmlTokenIndex = self.resolvedSteps.findIndex((step) =>
      Array.isArray(step)
        ? step.every((s) => s.expect === "html")
        : step.expect === "html"
    );
    if (htmlTokenIndex === -1) throw new Error("No html token found");

    const htmlTokenResponse = self.responses[htmlTokenIndex];
    (step as FlatRouteStep).htmlToken = getHTMLToken(
      //!
      Array.isArray(htmlTokenResponse)
        ? htmlTokenResponse[0]
        : (htmlTokenResponse as cheerio.CheerioAPI)
    );
  }
};

class ResolvedRoute<Params extends RouteParams> {
  studentID: string;
  params: Params;
  steps: Array<RouteStep<Params>> = [];
  resolvedSteps: Array<FlatRouteStep | FlatRouteStep[]> = [];
  responses: (RouteResponse | RouteResponse[])[] = [];
  constructor(studentID: string, params: Params, steps: typeof this.steps) {
    this.studentID = studentID;
    this.params = params;
    this.steps = steps;
    this.resolvedSteps = [];
    this.responses = [];
  }
  addResponse(response: (typeof this.responses)[number]) {
    this.responses.push(response);
  }
  get length() {
    return this.steps.length;
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.steps.length; i++) {
      let nextStep = this.steps[i];
      if (typeof nextStep === "function") {
        nextStep = nextStep({
          responses: this.responses,
          params: this.params,
          studentID: this.studentID,
        });
      }
      if (Array.isArray(nextStep)) {
        for (let i = 0; i < nextStep.length; i++) {
          const step = nextStep[i];
          processStep(this, step);
        }
      } else {
        processStep(this, nextStep);
      }
      const nextStepWithType = nextStep as FlatRouteStep[] | FlatRouteStep;
      this.resolvedSteps.push(nextStepWithType); //!
      yield { value: nextStepWithType, index: i }; //!
    }
  }
}
type RouteStepPredicate<Params extends RouteParams> = (
  params: Params
) => boolean;
export class Route<
  Params extends RouteParams = Record<string, never>
> extends CallableInstance<
  Params extends Record<string, never> ? [] : [Params],
  ResolvedRoute<Params>
> {
  steps: Array<RouteStep<Params>>;
  predicates: Record<number, RouteStepPredicate<Params>> = {};
  constructor() {
    super("call");
    this.steps = [];
    this.predicates = {};
  }
  step(
    step:
      | Omit<FlatRouteStep, "htmlToken">
      | ((props: {
          responses: RouteResponse[];
          params: Params;
          studentID: string;
        }) => Omit<FlatRouteStep, "htmlToken">),
    predicate?: RouteStepPredicate<Params>
  ) {
    this.steps.push(step);
    if (predicate) this.predicates[this.steps.length - 1] = predicate;
    return this;
  }
  multiple(
    multipleSteps:
      | Omit<FlatRouteStep, "htmlToken">[]
      | ((props: {
          responses: RouteResponse[];
          params: Params;
          studentID: string;
        }) => Omit<FlatRouteStep, "htmlToken">[]),
    predicate?: RouteStepPredicate<Params>
  ) {
    this.steps.push(multipleSteps);
    if (predicate) this.predicates[this.steps.length - 1] = predicate;
    return this;
  }
  call(...[studentID, params]: [string, Params]) {
    const filteredSteps = this.steps.filter((_, index) => {
      const predicate = this.predicates[index];
      if (!predicate) return true;
      return predicate(params);
    });
    return new ResolvedRoute(studentID, params, filteredSteps);
  }
}

export const myEdParsingRoutes = {
  //* query parameters mandatory for parsing to work
  schedule: new Route<{ day?: string }>()
    .step({
      method: "GET",
      path: "studentScheduleContextList.do?navkey=myInfo.sch.list",
      expect: "html",
    })
    .step(
      ({ params: { day } }) => ({
        method: "GET",
        path: `studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=&schoolOid=&k8Mode=&viewDate=${day}&userEvent=0`,
        expect: "html",
      }),
      ({ day }) => !!day
    ),
  currentWeekday: new Route().step({
    method: "GET",
    path: "studentScheduleContextList.do?navkey=myInfo.sch.list",
    expect: "html",
  }),

  personalDetails: new Route()
    .step({
      method: "GET",
      path: "portalStudentDetail.do?navkey=myInfo.details.detail",
      expect: "html",
    })
    .step({
      method: "POST",
      path: "portalStudentDetail.do?navkey=myInfo.details.detail",
      body: {
        userEvent: "2030",
        userParam: "2",
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    }),
};
export type MyEdParsingRoutes = typeof myEdParsingRoutes;
export type MyEdParsingRoute = keyof MyEdParsingRoutes;

export type MyEdRestEndpointURL = keyof paths;

type MyEdRestEndpointFlatInstruction = FlatRouteStep | FlatRouteStep[];
type MyEdRestEndpointInstruction = (props: {
  params: any;
  studentID: string;
}) => MyEdRestEndpointFlatInstruction;
export const myEdRestEndpoints = {
  subjects: new Route().step(({ studentID }) => ({
    method: "GET",
    path: `rest/lists/academics.classes.list`,
    body: { selectedStudent: studentID, fieldSetOid: "fsnX2Cls" },
    expect: "json",
  })),
  //TODO add ability to reuse steps in other steps
  subjectAssignments: new Route()
    .step(({ studentID }) => ({
      method: "GET",
      path: `rest/lists/academics.classes.list`,
      body: { selectedStudent: studentID, fieldSetOid: "fsnX2Cls" },
      expect: "json",
    }))
    .multiple(({ params: { subjectName }, responses }) => {
      console.log(responses[0], subjectName);
      const subjectId = (
        responses[0] as OpenAPI200JSONResponse<"/lists/academics.classes.list">
      ).find(
        (subject) => subject.relSscMstOid_mstDescription === subjectName
      )?.oid;
      console.log({ subjectId });
      return [
        {
          method: "GET",
          path: `rest/studentSchedule/${subjectId}/categoryDetails/pastDue`,
          expect: "json",
        },
        {
          method: "GET",
          path: `rest/studentSchedule/${subjectId}/categoryDetails/upcoming`,
          expect: "json",
        },
      ];
    }),
};

export type MyEdRestEndpoints = typeof myEdRestEndpoints;
export type MyEdRestEndpoint = keyof MyEdRestEndpoints;
export type ResolvedMyEdRestEndpoint<Endpoint extends MyEdRestEndpoint> =
  ReturnType<MyEdRestEndpoints[Endpoint]>;

export const ENDPOINTS = {
  ...myEdParsingRoutes,
  ...myEdRestEndpoints,
} satisfies Record<MyEdEndpoint, any>;
export type MyEdEndpoints = typeof ENDPOINTS;
export type MyEdEndpoint = MyEdParsingRoute | MyEdRestEndpoint;
