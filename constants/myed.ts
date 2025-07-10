import { timezonedDayJS } from "@/instances/dayjs";
import { $getTableBody } from "@/parsing/myed/helpers";
import { OpenAPI200JSONResponse } from "@/parsing/myed/types";
import { paths } from "@/types/myed-rest";
import { SubjectTerm, SubjectYear } from "@/types/school";
import CallableInstance from "callable-instance";
import * as cheerio from "cheerio";
import { Subject } from "../types/school";

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
  studentId: string;
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
  studentId?: string;
  params: Params;
  steps: Array<RouteStep<Params> | MetadataResolver<Params>> = [];
  resolvedSteps: Array<FlatRouteStep | FlatRouteStep[]> = [];
  responses: (RouteResponse | RouteResponse[])[] = [];
  metadata: Record<string, any>;
  requiresAuth: boolean;
  predicates: Record<number, RouteStepPredicate<Params>> = {};
  constructor({
    steps,
    predicates,
    studentId,
    params,
    requiresAuth,
  }: {
    studentId?: string;
    params: Params;
    steps: Array<RouteStep<Params> | MetadataResolver<Params>>;
    predicates: Record<number, RouteStepPredicate<Params>>;
    requiresAuth: boolean;
  }) {
    if (requiresAuth && !studentId) throw new Error("route requires auth");
    this.studentId = studentId;
    this.requiresAuth = requiresAuth;
    this.params = params;
    this.steps = steps;
    this.resolvedSteps = [];
    this.responses = [];
    this.metadata = {};
    this.predicates = predicates;
  }
  addResponse(response: (typeof this.responses)[number]) {
    this.responses.push(response);
  }
  get length() {
    return this.steps.length;
  }
  *[Symbol.iterator]() {
    for (let i = 0; i < this.steps.length; i++) {
      let nextStep = this.steps[i]!;
      const predicate = this.predicates[i];
      if (
        predicate &&
        !predicate({ params: this.params, metadata: this.metadata })
      ) {
        continue;
      }
      if (nextStep instanceof MetadataResolver) {
        nextStep.resolve({
          responses: this.responses,
          params: this.params,
          metadata: this.metadata,
          studentId: this.studentId as string,
        });
        continue;
      } else if (typeof nextStep === "function") {
        nextStep = nextStep({
          responses: this.responses,
          params: this.params,
          metadata: this.metadata,
          studentId: this.studentId as string,
        });
      }
      if (Array.isArray(nextStep)) {
        for (let i = 0; i < nextStep.length; i++) {
          const step = nextStep[i]!;
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
type RouteStepPredicate<Params extends RouteParams> = (args: {
  params: Params;
  metadata: Record<string, any>;
}) => boolean;
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
  metadata(
    resolver: MetadataResolverFunction<Params>,
    predicate?: RouteStepPredicate<Params>
  ) {
    this.steps.push(new MetadataResolver(resolver));
    if (predicate) this.predicates[this.steps.length - 1] = predicate;
    return this;
  }
  call(...[studentId, params]: [string, Params]) {
    return new ResolvedRoute({
      studentId,
      params,
      steps: this.steps,
      predicates: this.predicates,
      requiresAuth: this.requiresAuth,
    });
  }
}

export const myEdParsingRoutes = {
  //* query parameters mandatory for parsing to work
  schedule: new Route<{ date?: Date }>()
    .step({
      method: "GET",
      path: "studentScheduleContextList.do?navkey=myInfo.sch.list",
      expect: "html",
    })
    .metadata(({ responses, metadata }) => {
      const $ = responses[0]! as cheerio.CheerioAPI;
      const $termSelect = $("#selectedTermOid");
      if ($termSelect.children("[selected]").val() !== "date") {
        metadata.shouldSelectDateMode = true;
      }
    })
    .step(
      {
        method: "GET",
        path: "https://myeducation.gov.bc.ca/aspen/studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=date",
        expect: "html",
      },
      ({ metadata: { shouldSelectDateMode } }) => shouldSelectDateMode
    )
    .step(
      ({ params: { date } }) => {
        const day = timezonedDayJS(date).format(MYED_DATE_FORMAT);
        return {
          method: "GET",
          path: `studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=date&schoolOid=&k8Mode=&viewDate=${day}&userEvent=0`,
          expect: "html",
        };
      },
      ({ params: { date } }) => !!date
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
        userParam: "1",
      },
      contentType: "application/x-www-form-urlencoded",
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
  //not to be used in standalone, does not preserve state
  subjectAttendance: new Route<{
    subjectId: Subject["id"];
    year: SubjectYear;
  }>()
    .step({
      method: "GET",
      path: "portalClassList.do?navkey=academics.classes.list",
      expect: "html",
    })
    .step(({ params: { year } }) => ({
      method: "POST",
      path: "portalClassList.do",
      body: {
        userEvent: "950",
        yearFilter: year,
        termFilter: "all",
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    }))
    .step(({ params: { subjectId } }) => ({
      method: "POST",
      path: "portalClassList.do",
      body: {
        userEvent: "2100",
        userParam: subjectId,
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    }))
    .step({
      method: "GET",
      path: "https://myeducation.gov.bc.ca/aspen/contextList.do?navkey=academics.classes.list.pat",
      expect: "html",
    })
    .metadata(({ responses, metadata }) => {
      const $ = responses.at(-1)! as cheerio.CheerioAPI;
      const $tableBody = $getTableBody($);
      if (!$tableBody) throw new Error("No table body");
      if ("knownError" in $tableBody) {
        metadata.shouldSetupFilters = true;
      }
    })
    .step(
      {
        method: "POST",
        path: "filterAdvanced.do",
        body: {
          userEvent: "930",
          selectedBaseFilter: "###all",
        },
        contentType: "application/x-www-form-urlencoded",
        expect: "html",
      },
      ({ metadata: { shouldSetupFilters } }) => shouldSetupFilters
    )
    .step(
      {
        method: "POST",
        body: {
          userEvent: "910",
        },
        path: "contextList.do",
        contentType: "application/x-www-form-urlencoded",
        expect: "html",
      },
      ({ metadata: { shouldSetupFilters } }) => shouldSetupFilters
    ),
};
export type MyEdParsingRoutes = typeof myEdParsingRoutes;
export type MyEdParsingRoute = keyof MyEdParsingRoutes;

export type MyEdRestEndpointURL = keyof paths;

const subjectTermToGradeLabelsMap: Record<
  SubjectTerm,
  Array<
    OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/gradeTerms">["terms"][number]["gradeTermId"]
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

const generateSubjectsListStepParams = (
  studentId: string,
  params?: {
    isPreviousYear?: boolean;
    termId?: string;
  }
) => {
  const { isPreviousYear, termId } = params ?? {};
  const customParams = [];
  if (isPreviousYear) customParams.push("selectedYear|previous");
  if (termId) customParams.push(`selectedTerm|${termId}`);
  return {
    method: "GET" as const,
    path: `rest/lists/academics.classes.list`,
    body: {
      selectedStudent: studentId,
      fieldSetOid: "fsnX2Cls",
      customParams: customParams.join(";"),
    },
    expect: "json" as const,
  };
};
const findSubjectIdByName = (subjects: RouteResponse, name: string) => {
  return (
    subjects as OpenAPI200JSONResponse<"/lists/academics.classes.list">
  ).find((subject) => subject.relSscMstOid_mstDescription === name)?.oid;
};

const subjectAssignmentsRoute = new Route<
  {
    id: string;
  } & ({ termId?: string } | { term: SubjectTerm; termId?: string })
>()
  .step(({ params: { id } }) => {
    return {
      method: "GET",
      path: `rest/studentSchedule/${id}/gradeTerms`,
      expect: "json",
    };
  })
  .multiple(({ responses, params: { id, ...rest } }) => {
    const termsResponse = responses.at(
      -1
    ) as OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/gradeTerms">;
    let termIdsToSearch;

    //runtime check, TODO: change to type check
    if ("term" in rest && typeof rest.term !== "string") {
      throw new Error("Invalid term");
    }

    if ("term" in rest) {
      const termLabelsToSearch = subjectTermToGradeLabelsMap[rest.term];
      if (!termLabelsToSearch) throw new Error("Invalid term");
      termIdsToSearch = [];

      for (const termLabel of termLabelsToSearch) {
        const foundTerm = termsResponse.terms.find(
          (term) => term.gradeTermId === termLabel
        );
        if (foundTerm) termIdsToSearch.push(foundTerm.oid);
      }
    } else {
      if (rest.termId) {
        termIdsToSearch = [rest.termId];
      } else if (typeof termsResponse.currentTermIndex === "number") {
        termIdsToSearch = [
          termsResponse.terms[termsResponse.currentTermIndex]!.oid,
        ];
      }
    }

    if (!termIdsToSearch) throw new Error("No term ids to search");
    return termIdsToSearch.flatMap((termId) => [
      {
        method: "GET",
        path: `rest/studentSchedule/${id}/categoryDetails/pastDue`,
        body: {
          gradeTermOid: termId,
        },
        expect: "json",
      },
      {
        method: "GET",
        path: `rest/studentSchedule/${id}/categoryDetails/upcoming`,
        body: {
          gradeTermOid: termId,
        },
        expect: "json",
      },
    ]);
  });
export const MYED_ALL_GRADE_TERMS_SELECTOR = "all";
export const myEdRestEndpoints = {
  subjects: new Route<{
    isPreviousYear?: boolean;
    termId?: string;
  }>()
    .step(({ params: { isPreviousYear, termId } }) => ({
      method: "GET",
      path: `rest/lists/academics.classes.list/studentGradeTerms`,
      body: {
        year: isPreviousYear ? "previous" : "current",
        term: termId || MYED_ALL_GRADE_TERMS_SELECTOR,
      },
      expect: "json",
    }))
    .step(({ studentId, params: { isPreviousYear, termId } }) => {
      return generateSubjectsListStepParams(studentId, {
        isPreviousYear,
        termId,
      });
    }),
  subjectSummary: new Route<{
    id: string;
    //* required for absences to work
    year: SubjectYear;
  }>().step(({ params: { id } }) => ({
    method: "GET",
    path: `rest/studentSchedule/${id}/academics`,
    body: {
      properties:
        "relSscMstOid.mstDescription,relSscMstOid.mstCourseView,sscTermView",
    },
    expect: "json",
  })),
  subjectIdByName: new Route<{
    name: string;
  }>()
    .step(({ studentId }) =>
      generateSubjectsListStepParams(studentId, {
        termId: MYED_ALL_GRADE_TERMS_SELECTOR,
      })
    )
    .metadata(({ params: { name }, responses, metadata }) => {
      const targetResponse = responses[0]!;
      metadata.subjectId = findSubjectIdByName(targetResponse, name as string);
      if (!metadata.subjectId) {
        metadata.shouldSearchInPreviousYear = true;
      }
    })
    .step(
      ({ studentId }) =>
        generateSubjectsListStepParams(studentId, {
          isPreviousYear: true,
          termId: MYED_ALL_GRADE_TERMS_SELECTOR,
        }),
      ({ metadata: { shouldSearchInPreviousYear } }) =>
        shouldSearchInPreviousYear
    )
    .metadata(
      ({ responses, metadata, params: { name } }) => {
        const targetResponse = responses[1]!;

        metadata.subjectId = findSubjectIdByName(
          targetResponse,
          name as string
        );
        if (!metadata.subjectId) {
          throw new Error("Subject not found");
        }
      },
      ({ metadata: { shouldSearchInPreviousYear } }) =>
        shouldSearchInPreviousYear
    ),
  //TODO add ability to reuse steps in other steps
  subjectAssignments: subjectAssignmentsRoute,
  subjectAssignment: new Route<{
    assignmentId: string;
  }>().step(({ studentId, params: { assignmentId } }) => ({
    method: "GET",
    path: `rest/students/${studentId}/assignments/${assignmentId}`,
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
