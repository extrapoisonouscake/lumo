import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import { paths } from "@/types/myed-rest";
import CallableInstance from "callable-instance";
import * as cheerio from "cheerio";

export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen/";
export const MYED_HTML_TOKEN_INPUT_NAME = "org.apache.struts.taglib.html.TOKEN";

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
type RouteResolverParams<Params extends RouteParams> = {
  responses: RouteResponse[];
  params: Params;
  metadata: Record<string, any>;
  studentID: string;
};
type MetadataResolverFunction<Params extends RouteParams> = (
  props: RouteResolverParams<Params>
) => void;
class MetadataResolver<Params extends RouteParams> {
  constructor(private resolver: MetadataResolverFunction<Params>) {}
  resolve(props: RouteResolverParams<Params>) {
    this.resolver(props);
  }
}
type RouteResolver<
  T extends
    | Omit<FlatRouteStep, "htmlToken">
    | Omit<FlatRouteStep, "htmlToken">[],
  Params extends RouteParams
> = (props: RouteResolverParams<Params>) => T;
type SingularRouteStep<Params extends RouteParams> =
  | Omit<FlatRouteStep, "htmlToken">
  | RouteResolver<Omit<FlatRouteStep, "htmlToken">, Params>;
type MultipleRouteStep<Params extends RouteParams> =
  | Omit<FlatRouteStep, "htmlToken">[]
  | RouteResolver<Omit<FlatRouteStep, "htmlToken">[], Params>;
type RouteStep<Params extends RouteParams> =
  | SingularRouteStep<Params>
  | MultipleRouteStep<Params>;

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
    (step as FlatRouteStep).htmlToken = parseHTMLToken(
      //!
      Array.isArray(htmlTokenResponse)
        ? htmlTokenResponse[0]
        : (htmlTokenResponse as cheerio.CheerioAPI)
    );
  }
};

class ResolvedRoute<Params extends RouteParams> {
  studentID?: string;
  params: Params;
  steps: Array<RouteStep<Params> | MetadataResolver<Params>> = [];
  resolvedSteps: Array<FlatRouteStep | FlatRouteStep[]> = [];
  responses: (RouteResponse | RouteResponse[])[] = [];
  metadata: Record<string, any>;
  requiresAuth: boolean;
  constructor({
    steps,
    studentID,
    params,
    requiresAuth,
  }: {
    studentID?: string;
    params: Params;
    steps: Array<RouteStep<Params> | MetadataResolver<Params>>;
    requiresAuth: boolean;
  }) {
    if (requiresAuth && !studentID) throw new Error("route requires auth");
    this.studentID = studentID;
    this.requiresAuth = requiresAuth;
    this.params = params;
    this.steps = steps;
    this.resolvedSteps = [];
    this.responses = [];
    this.metadata = {};
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
      if (nextStep instanceof MetadataResolver) {
        nextStep.resolve({
          responses: this.responses,
          params: this.params,
          metadata: this.metadata,
          studentID: this.studentID as string,
        });
        continue;
      } else if (typeof nextStep === "function") {
        nextStep = nextStep({
          responses: this.responses,
          params: this.params,
          metadata: this.metadata,
          studentID: this.studentID as string,
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
  requiresAuth: boolean;
  steps: Array<RouteStep<Params> | MetadataResolver<Params>>;
  predicates: Record<number, RouteStepPredicate<Params>> = {};
  constructor(requiresAuth = true) {
    super("call");
    this.steps = [];
    this.predicates = {};
    this.requiresAuth = requiresAuth;
  }
  step(
    step: SingularRouteStep<Params>,
    predicate?: RouteStepPredicate<Params>
  ) {
    this.steps.push(step);
    if (predicate) this.predicates[this.steps.length - 1] = predicate;
    return this;
  }
  multiple(
    multipleSteps: MultipleRouteStep<Params>,
    predicate?: RouteStepPredicate<Params>
  ) {
    this.steps.push(multipleSteps);
    if (predicate) this.predicates[this.steps.length - 1] = predicate;
    return this;
  }
  metadata(resolver: MetadataResolverFunction<Params>) {
    this.steps.push(new MetadataResolver(resolver));
    return this;
  }
  call(...[studentID, params]: [string, Params]) {
    const filteredSteps = this.steps.filter((_, index) => {
      const predicate = this.predicates[index];
      if (!predicate) return true;
      return predicate(params);
    });
    return new ResolvedRoute({
      studentID,
      params,
      steps: filteredSteps,
      requiresAuth: this.requiresAuth,
    });
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
  registrationFields: new Route(false).step({
    method: "GET",
    path: "accountCreation.do",
    expect: "html",
  }),
};
export type MyEdParsingRoutes = typeof myEdParsingRoutes;
export type MyEdParsingRoute = keyof MyEdParsingRoutes;

export type MyEdRestEndpointURL = keyof paths;

export const myEdRestEndpoints = {
  subjects: new Route<{
    isPreviousYear?: boolean;
    termOid?: string;
  }>()
    .step(({ params: { isPreviousYear, termOid } }) => ({
      method: "GET",
      path: `rest/lists/academics.classes.list/studentGradeTerms`,
      body: {
        year: isPreviousYear ? "previous" : "current",
        term: termOid ? termOid : "all",
      },
      expect: "json",
    }))
    .step(({ studentID, params: { isPreviousYear, termOid } }) => {
      const customParams = [];
      if (isPreviousYear) customParams.push("selectedYear|previous");
      if (termOid) customParams.push(`selectedTerm|${termOid}`);
      return {
        method: "GET",
        path: `rest/lists/academics.classes.list`,
        body: {
          selectedStudent: studentID,
          fieldSetOid: "fsnX2Cls",
          customParams: customParams.join(";"),
        },
        expect: "json",
      };
    }),
  //TODO add ability to reuse steps in other steps
  subjectAssignments: new Route<{
    subjectName: string;
    subjectId?: string;
    termOid?: string;
  }>()
    .step(
      ({ studentID }) => ({
        method: "GET",
        path: `rest/lists/academics.classes.list`,
        body: {
          selectedStudent: studentID,
          fieldSetOid: "fsnX2Cls",
          customParams: "selectedYear|current;selectedTerm|all",
        },
        expect: "json",
      }),
      ({ subjectId }) => !subjectId
    )
    .metadata(
      ({
        params: { subjectName, subjectId: externalSubjectId },
        responses,
        metadata,
      }) => {
        let subjectId = externalSubjectId;
        if (!subjectId) {
          subjectId = (
            responses[0] as OpenAPI200JSONResponse<"/lists/academics.classes.list">
          ).find(
            (subject) => subject.relSscMstOid_mstDescription === subjectName
          )?.oid;
          if (!subjectId) throw new Error("Subject not found");
        }
        metadata.subjectId = subjectId;
      }
    )
    .step(({ metadata: { subjectId } }) => ({
      method: "GET",
      path: `rest/studentSchedule/${subjectId}/gradeTerms`,
      expect: "json",
    }))
    .multiple(({ responses, metadata: { subjectId }, params: { termOid } }) => {
      let selectedTermOid = termOid;
      if (!selectedTermOid) {
        const foundTerms = responses.at(
          -1
        ) as OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/gradeTerms">;
        if (typeof foundTerms.currentTermIndex === "number") {
          selectedTermOid = foundTerms.terms[foundTerms.currentTermIndex].oid;
        }
      }

      return [
        {
          method: "GET",
          path: `rest/studentSchedule/${subjectId}/categoryDetails/pastDue`,
          body: {
            gradeTermOid: selectedTermOid,
          },
          expect: "json",
        },
        {
          method: "GET",
          path: `rest/studentSchedule/${subjectId}/categoryDetails/upcoming`,
          body: {
            gradeTermOid: selectedTermOid,
          },
          expect: "json",
        },
      ];
    }),
  subjectAssignment: new Route<{
    assignmentId: string;
  }>().step(({ studentID, params: { assignmentId } }) => ({
    method: "GET",
    path: `rest/students/${studentID}/assignments/${assignmentId}`,
    expect: "json",
  })),
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
