import {
  MYED_ALL_GRADE_TERMS_SELECTOR,
  MYED_DATE_FORMAT,
  parseHTMLToken,
  subjectTermToGradeLabelsMap,
} from "@/constants/myed";
import "server-only";

import { CookieMyEdUser } from "@/helpers/getAuthCookies";
import { timezonedDayJS } from "@/instances/dayjs";
import { paths } from "@/types/myed-rest";
import { Subject, SubjectTerm, SubjectYear, UserRole } from "@/types/school";
import CallableInstance from "callable-instance";
import * as cheerio from "cheerio";
import { $getGenericContentTableBody } from "./helpers";
import { OpenAPI200JSONResponse } from "./types";

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
        | "multipart/form-data"
        | "application/json";
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
  targetId: string;
  user: CookieMyEdUser;
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
  Params extends RouteParams,
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
  targetId?: string;
  myedUser?: CookieMyEdUser;
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
    targetId,
    params,
    requiresAuth,
    myedUser,
  }: {
    myedUser?: CookieMyEdUser;
    targetId?: string;
    params: Params;
    steps: Array<RouteStep<Params> | MetadataResolver<Params>>;
    predicates: Record<number, RouteStepPredicate<Params>>;
    requiresAuth: boolean;
  }) {
    if (requiresAuth && !targetId) throw new Error("route requires auth");
    this.myedUser = myedUser;
    this.targetId = targetId;
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
          targetId: this.targetId as string,
          user: this.myedUser as CookieMyEdUser,
        });
        continue;
      } else if (typeof nextStep === "function") {
        nextStep = nextStep({
          responses: this.responses,
          params: this.params,
          metadata: this.metadata,
          targetId: this.targetId as string,
          user: this.myedUser as CookieMyEdUser,
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
  Params extends RouteParams = Record<string, never>,
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
  call(
    ...[{ targetId, myedUser }, params]: [
      { targetId: string; myedUser: CookieMyEdUser },
      Params,
    ]
  ) {
    return new ResolvedRoute({
      targetId,
      myedUser,
      params,
      steps: this.steps,
      predicates: this.predicates,
      requiresAuth: this.requiresAuth,
    });
  }
}
const generateAssignmentFileSubmissionStateParams = ({
  assignmentId,
  targetId,
}: {
  assignmentId: string;
  targetId: string;
}) => {
  const params = new URLSearchParams({
    prefix: assignmentId.slice(0, 3),
    oid: assignmentId,
    context: "academics.classes.list.gcd.detail",
    studentId: targetId,
    deploymentId: "aspen",
  });
  return {
    method: "GET" as const,
    path: `/portalAssignmentDetailPopup.do?${params.toString()}`,
    expect: "html" as const,
  };
};
//TODO: divide steps into "required" and the ones that make request independent of state
export const myEdParsingRoutes = {
  //* query parameters mandatory for parsing to work
  schedule: new Route<{ day?: string }>()
    .step({
      method: "GET",
      path: "/studentScheduleContextList.do?navkey=myInfo.sch.list",
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
        method: "POST",
        path: "/studentScheduleContextList.do",
        body: {
          userEvent: "2210",
          selectedTermOid: "date",
        },
        contentType: "application/x-www-form-urlencoded",
        expect: "html",
      },
      ({ metadata: { shouldSelectDateMode } }) => shouldSelectDateMode
    )
    .step(
      ({ params: { day } }) => {
        //day in myed formay
        return {
          method: "POST",
          path: "/studentScheduleContextList.do",
          body: {
            userEvent: "2000",
            matrixDate: day,
            selectedTermOid: "date",
          },
          contentType: "application/x-www-form-urlencoded",
          expect: "html",
        };
      },
      ({ params: { day } }) => {
        const today = timezonedDayJS().format(MYED_DATE_FORMAT);
        return today !== day;
      }
    ),

  studentDetails: new Route()
    .step(({ user: { role } }) => ({
      method: "GET",
      path:
        role === UserRole.Student
          ? "/portalStudentDetail.do?navkey=myInfo.details.detail"
          : "/genericDetail.do?navkey=family.std.list.detail",
      expect: "html",
    }))
    .step(({ user: { role } }) => ({
      method: "POST",
      path:
        role === UserRole.Student
          ? "/portalStudentDetail.do?navkey=myInfo.details.detail"
          : "/genericDetail.do?navkey=family.std.list.detail",
      body: {
        userEvent: "2030",
        userParam: "0",
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    }))
    .step(({ user: { role } }) => ({
      method: "POST",
      path:
        role === UserRole.Student
          ? "/portalStudentDetail.do?navkey=myInfo.details.detail"
          : "/genericDetail.do?navkey=family.std.list.detail",
      body: {
        userEvent: "2030",
        userParam: "1",
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    }))
    .step(({ user: { role } }) => ({
      method: "POST",
      path:
        role === UserRole.Student
          ? "/portalStudentDetail.do?navkey=myInfo.details.detail"
          : "/genericDetail.do?navkey=family.std.list.detail",
      body: {
        userEvent: "2030",
        userParam: "2",
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    })),
  registrationFields: new Route(false).step({
    method: "GET",
    path: "/accountCreation.do",
    expect: "html",
  }),
  //not to be used in standalone, does not preserve state
  subjectAttendance: new Route<{
    subjectId: Subject["id"];
    year: SubjectYear;
  }>()
    .step({
      method: "GET",
      path: "/portalClassList.do?navkey=academics.classes.list",
      expect: "html",
    })
    //force to show all terms
    .step(({ params: { year } }) => ({
      method: "POST",
      path: "/portalClassList.do",
      body: {
        userEvent: "950",
        yearFilter: year,
        termFilter: "all",
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    }))
    //switch to desired subject
    .step(({ params: { subjectId } }) => ({
      method: "POST",
      path: "/portalClassList.do",
      body: {
        userEvent: "2100",
        userParam: subjectId,
      },
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    }))
    .step({
      method: "GET",
      path: "/contextList.do?navkey=academics.classes.list.pat",
      expect: "html",
    })
    .metadata(({ responses, metadata }) => {
      const $ = responses.at(-1)! as cheerio.CheerioAPI;
      const $tableBody = $getGenericContentTableBody($);
      if (!$tableBody) throw new Error("No table body");
      if ("knownError" in $tableBody) {
        metadata.shouldSetupFilters = true;
      }
    })
    .step(
      {
        method: "POST",
        path: "/filterAdvanced.do",
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
        path: "/contextList.do",
        contentType: "application/x-www-form-urlencoded",
        expect: "html",
      },
      ({ metadata: { shouldSetupFilters } }) => shouldSetupFilters
    ),
  transcriptEntries: new Route()
    .step({
      method: "GET",
      path: "/portalStudentDetail.do?navkey=myInfo.details.detail",
      expect: "html",
    })
    .step({
      method: "GET",
      path: "/transcriptList.do?navkey=myInfo.trn.list",
      expect: "html",
    }),
  graduationSummary: new Route()

    .step({
      method: "GET",
      path: "/portalStudentDetail.do?navkey=myInfo.details.detail",
      expect: "html",
    })
    .step({
      method: "GET",
      path: "/graduationSummary.do?includeProjection=false&navkey=myInfo.gradSummary.graduation",
      expect: "html",
    })
    .metadata(({ responses, metadata }) => {
      const $ = responses[0]! as cheerio.CheerioAPI;
      const areAlreadyCountedEntriesHidden =
        $("#hideAlreadyCounted").attr("checked") === "checked";
      const areExcessCoursesSeparated =
        $("#separateExcessCourses").attr("checked") === "checked";
      metadata.areAlreadyCountedEntriesHidden = areAlreadyCountedEntriesHidden;
      metadata.areExcessCoursesSeparated = areExcessCoursesSeparated;
    })
    .step(
      () => {
        return {
          method: "POST",
          path: "/aspen/preferenceUpdate.do",
          contentType: "application/x-www-form-urlencoded",
          body: {
            preference: "sys.graduation.course.separate.excessive",
            value: "true",
          },
          expect: "json",
        };
      },
      ({ metadata: { areExcessCoursesSeparated } }) =>
        !areExcessCoursesSeparated
    )
    .step(
      () => {
        return {
          method: "POST",
          path: "/preferenceUpdate.do",
          contentType: "application/x-www-form-urlencoded",
          body: {
            preference: "sys.graduation.course.hideNotAssigned",
            value: "false",
          },
          expect: "json",
        };
      },
      ({ metadata: { areAlreadyCountedEntriesHidden } }) =>
        areAlreadyCountedEntriesHidden
    )
    .step(
      {
        method: "GET",
        path: "/graduationSummary.do?includeProjection=false&navkey=myInfo.gradSummary.graduation",
        expect: "html",
      },
      ({
        metadata: { areAlreadyCountedEntriesHidden, areExcessCoursesSeparated },
      }) => areAlreadyCountedEntriesHidden || !areExcessCoursesSeparated
    ),
  assignmentFileSubmissionState: new Route<{ assignmentId: string }>().step(
    ({ params: { assignmentId }, targetId }) => {
      return generateAssignmentFileSubmissionStateParams({
        assignmentId,
        targetId,
      });
    }
  ),
  uploadAssignmentFile: new Route<{ assignmentId: string; file: File }>()
    .step(({ targetId, params: { assignmentId } }) =>
      generateAssignmentFileSubmissionStateParams({ assignmentId, targetId })
    )
    .step(({ targetId, params: { assignmentId, file } }) => ({
      method: "POST",
      path: "/assignmentUpload.do",
      body: {
        formFile: file,
        assignmentOid: assignmentId,
        studentOid: targetId,
        userEvent: "970",
      },
      contentType: "multipart/form-data",
      expect: "html",
    })),
  deleteAssignmentFile: new Route<{ assignmentId: string }>()
    .step({
      method: "GET",
      path: `/home.do`,
      expect: "html",
    })
    .step(({ params: { assignmentId } }) => ({
      method: "POST",
      path: `/portalAssignmentDetail.do?userEvent=2050&submissionOid=${assignmentId}`,
      contentType: "application/x-www-form-urlencoded",
      expect: "html",
    })),
};
export type MyEdParsingRoutes = typeof myEdParsingRoutes;
export type MyEdParsingRoute = keyof MyEdParsingRoutes;

export type MyEdRestEndpointURL = keyof paths;

const generateSubjectsListStepParams = (
  targetId: string,
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
    path: `/aspen/rest/lists/academics.classes.list`,
    body: {
      selectedStudent: targetId,
      fieldSetOid: "fsnX2Cls",
      customParams: customParams.join(";"),
    },
    expect: "json" as const,
  };
};
const findSubjectIdByName = (subjects: RouteResponse, name: string) => {
  return (
    subjects as OpenAPI200JSONResponse<"/aspen/rest/lists/academics.classes.list">
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
      path: `/aspen/rest/studentSchedule/${id}/gradeTerms`,
      expect: "json",
    };
  })
  .multiple(({ responses, params: { id, ...rest } }) => {
    const termsResponse = responses.at(
      -1
    ) as OpenAPI200JSONResponse<"/aspen/rest/studentSchedule/{subjectOid}/gradeTerms">;
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
        path: `/aspen/rest/studentSchedule/${id}/categoryDetails/pastDue`,
        body: {
          gradeTermOid: termId,
        },
        expect: "json",
      },
      {
        method: "GET",
        path: `/aspen/rest/studentSchedule/${id}/categoryDetails/upcoming`,
        body: {
          gradeTermOid: termId,
        },
        expect: "json",
      },
    ]);
  });

export const myEdRestEndpoints = {
  personalDetails: new Route().step({
    method: "GET",
    path: `/aspen/rest/users/currentUser`,

    expect: "json",
  }),
  subjects: new Route<{
    isPreviousYear?: boolean;
    termId?: string;
  }>()
    .step(({ params: { isPreviousYear, termId } }) => ({
      method: "GET",
      path: `/aspen/rest/lists/academics.classes.list/studentGradeTerms`,
      body: {
        year: isPreviousYear ? "previous" : "current",
        term: termId || MYED_ALL_GRADE_TERMS_SELECTOR,
      },
      expect: "json",
    }))
    .step(({ targetId, params: { isPreviousYear, termId } }) => {
      return generateSubjectsListStepParams(targetId, {
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
    path: `/aspen/rest/studentSchedule/${id}/academics`,
    body: {
      properties:
        "relSscMstOid.mstDescription,relSscMstOid.mstCourseView,sscTermView",
    },
    expect: "json",
  })),
  subjectIdByName: new Route<{
    name: string;
  }>()
    .step(({ targetId }) =>
      generateSubjectsListStepParams(targetId, {
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
      ({ targetId }) =>
        generateSubjectsListStepParams(targetId, {
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
  }>().step(({ targetId, params: { assignmentId } }) => ({
    method: "GET",
    path: `/aspen/rest/students/${targetId}/assignments/${assignmentId}`,
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
