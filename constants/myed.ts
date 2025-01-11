import CallableInstance from "callable-instance";
import { MyEdEndpoints } from "@/types/myed";
import * as cheerio from "cheerio";

export const MYED_ROOT_URL = "https://myeducation.gov.bc.ca/aspen";
export const MYED_HTML_TOKEN_INPUT_NAME = "org.apache.struts.taglib.html.TOKEN";
type EndpointArrayResolveValue = Array<
  EndpointReturnTypes | ((html: string) => EndpointReturnTypes)
>;
export type EndpointFetchParameters = [string, Parameters<typeof fetch>[1]?];
export type EndpointReturnTypes = string | EndpointFetchParameters;
export type AllowedEndpointResolveValues = string | EndpointArrayResolveValue;
export type AllowedEndpointValues =
  | AllowedEndpointResolveValues
  | ((params: Record<string, any>) => AllowedEndpointResolveValues);
export const MYED_ENDPOINTS = {
  //* query parameters are mandatory to work
  login: "logon.do?mobile=1",
  subjects: "portalClassList.do?navkey=academics.classes.list",
  subjectAssignments: ({ name }: { name?: string }) => [
    "portalClassList.do?navkey=academics.classes.list",
    (html) => {
      const $ = cheerio.load(html);
      const token = $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`)
        .first()
        .val();
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
      const params = new URLSearchParams({
        [MYED_HTML_TOKEN_INPUT_NAME]: `${token}`,
        userEvent: "2100",
        userParam: subjectId,
      });
      return [
        "portalClassList.do",
        {
          method: "POST",
          body: params,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      ];
    },
    "portalAssignmentList.do?navkey=academics.classes.list.gcd",
  ],
  schedule: ({ day }: { day?: string }) => {
    const baseEndpoints: EndpointArrayResolveValue = [
      "studentScheduleContextList.do?navkey=myInfo.sch.list",
    ];
    if (day) {
      baseEndpoints.push(
        `studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=&schoolOid=&k8Mode=&viewDate=${day}&userEvent=0`
      );
    }
    return baseEndpoints;
  },
  currentWeekday: "studentScheduleContextList.do?navkey=myInfo.sch.list",
  logout: "logout.do",
  personalDetails: [
    "portalStudentDetail.do?navkey=myInfo.details.detail",
    (html) => {
      const $ = cheerio.load(html);
      const token = $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`)
        .first()
        .val();
      const params = new URLSearchParams({
        [MYED_HTML_TOKEN_INPUT_NAME]: `${token}`,
        userEvent: "2030",
        userParam: "2",
      });
      return [
        "portalStudentDetail.do?navkey=myInfo.details.detail",
        {
          method: "POST",
          body: params,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      ];
    },
  ],
} as const satisfies Record<string, AllowedEndpointValues>;
export type EndpointResolvedValue<T extends MyEdEndpoints> =
  T extends MyEdEndpoints
  ? (typeof MYED_ENDPOINTS)[T] extends (...args: any[]) => infer R
  ? R
  : (typeof MYED_ENDPOINTS)[T]
  : never;
export const MYED_SESSION_COOKIE_NAME = "JSESSIONID";
export const MYED_AUTHENTICATION_COOKIES_NAMES = [
  MYED_SESSION_COOKIE_NAME,
  "deploymentId",
  "ApplicationGatewayAffinity",
  "ApplicationGatewayAffinityCORS",
];
export const MYED_DATE_FORMAT = "YYYY-MM-DD";
type FlatParsingRouteStep = {
  method: "GET" | "POST"
  path: string
} & ({
  contentType: "application/x-www-form-urlencoded" | "application/json" | "form-data"
  body: Record<string, any>
} | { contentType?: never, body?: never })
type ParsingRouteParams = Record<string, any> | undefined;
type ParsingRouteStep<Params extends ParsingRouteParams> = FlatParsingRouteStep | ((props: { $previousDocuments: cheerio.CheerioAPI[], params: Params }) => FlatParsingRouteStep)

class ResolvedParsingRoute<Params extends ParsingRouteParams> {
  params: Params
  steps: Array<ParsingRouteStep<Params>> = []
  $previousDocuments: cheerio.CheerioAPI[]
  constructor(params: Params, steps: Array<ParsingRouteStep<Params>>) {
    this.params = params
    this.steps = []
    this.$previousDocuments = []
  }
  addDocument($document: cheerio.CheerioAPI) {
    this.$previousDocuments.push($document)
  }
  *[Symbol.iterator]() {
    for (let nextStep of this.steps) {
      if (typeof nextStep === 'function') {
        nextStep = nextStep({ $previousDocuments: this.$previousDocuments, params: this.params })
      }
      yield nextStep
    }
  }
}
type ParsingRouteStepPredicate<Params extends ParsingRouteParams> = (params: Params) => boolean
export class ParsingRoute<Params extends ParsingRouteParams> extends CallableInstance<[Params], ResolvedParsingRoute<Params>> {
  steps: Array<ParsingRouteStep<Params>>
  predicates: Record<number, ParsingRouteStepPredicate<Params>> = {}
  constructor() {
    super('call')
    this.steps = []
    this.predicates = {}
  }
  step(step: (typeof this)['steps'][number], predicate?: ParsingRouteStepPredicate<Params>) {
    this.steps.push(step)
    if (predicate) this.predicates[this.steps.length - 1] = predicate
    return this
  }
  private call(params: Params) {
    const filteredSteps = this.steps.filter((_, index) => {
      const predicate = this.predicates[index]
      if (!predicate) return true
      return predicate(params)
    })
    return new ResolvedParsingRoute(params, filteredSteps)
  }
}



export const MYED_ROUTES = {
  //* query parameters mandatory for parsing to work
  login: new ParsingRoute().step({ method: "GET", path: "logon.do?mobile=1" }),
  subjects: new ParsingRoute().step({ method: "GET", path: "portalClassList.do?navkey=academics.classes.list" }),
  subjectAssignments: new ParsingRoute<{ name?: string }>().step({ method: "GET", path: "portalClassList.do?navkey=academics.classes.list" }).step(({ $previousDocuments: [$], params: { name } }) => {
    const token = $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`)
      .first()
      .val();
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
      [MYED_HTML_TOKEN_INPUT_NAME]: `${token}`,
      userEvent: "2100",
      userParam: subjectId,
    }
    return {
      method: "POST", path: "portalClassList.do",
      body: params,
      contentType: "application/x-www-form-urlencoded"
    }

  }).step({ method: "GET", path: "portalAssignmentList.do?navkey=academics.classes.list.gcd" }),
  schedule: new ParsingRoute<{ day?: string }>().step({ method: "GET", path: "studentScheduleContextList.do?navkey=myInfo.sch.list" }).step(({ params: { day } }) => ({ method: "GET", path: `studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=&schoolOid=&k8Mode=&viewDate=${day}&userEvent=0` }), ({ day }) => !!day),
  currentWeekday: new ParsingRoute().step({ method: "GET", path: "studentScheduleContextList.do?navkey=myInfo.sch.list" }),
  logout: new ParsingRoute().step({ method: "GET", path: "logout.do" }),
  personalDetails: new ParsingRoute().step({ method: "GET", path: "portalStudentDetail.do?navkey=myInfo.details.detail" }).step(({ $previousDocuments: [$]}) => {
    const token = $(`input[name="${MYED_HTML_TOKEN_INPUT_NAME}"]`)
      .first()
      .val();
    const params = {
      [MYED_HTML_TOKEN_INPUT_NAME]: `${token}`,
      userEvent: "2030",
      userParam: "2",
    };
    return {
      method: "POST",
      path: "portalStudentDetail.do?navkey=myInfo.details.detail",
      body: params,
      contentType: "application/x-www-form-urlencoded"
    }

  })
}