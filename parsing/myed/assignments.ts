import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";
import { locallyTimezonedDayJS } from "@/instances/dayjs";
import { components } from "@/types/myed-rest";
import {
  Assignment,
  AssignmentStatus,
  AssignmentSubmissionFile,
  AssignmentSubmissionState,
  TermEntry,
} from "@/types/school";
import { OpenAPI200JSONResponse, ParserFunctionArguments } from "./types";

const scoreLabelToStatus: Record<string, AssignmentStatus> = {
  NHI: AssignmentStatus.Missing,
  REC: AssignmentStatus.Exempt,
  Ungraded: AssignmentStatus.Ungraded,
};
function convertAssignment({
  name,
  dueDate,
  totalPoints,
  assignedDate,
  classAverage,
  oid,
  scoreElements,
  remark,
  categoryOid,
}: components["schemas"]["StudentAssignment"]): Assignment {
  const scoreElement = scoreElements[0];

  const baseAssignment: Omit<Assignment, "status" | "score"> = {
    id: oid,
    name: prettifyEducationalName(name),
    dueAt: new Date(dueDate),
    assignedAt: new Date(assignedDate),
    classAverage: +(classAverage.split(" ")[0] as string) || null,
    feedback: remark ?? null,
    categoryId: categoryOid,
    maxScore: totalPoints,
  };
  if (scoreElement) {
    const { scoreLabel, score } = scoreElement;

    if (typeof score === "number" || (score && score !== "NaN")) {
      return {
        ...baseAssignment,
        status: AssignmentStatus.Graded,
        score: +score,
      };
    } else if (scoreLabel) {
      const status =
        scoreLabelToStatus[scoreLabel] ?? AssignmentStatus.Ungraded;
      return {
        ...baseAssignment,
        status: status as Exclude<AssignmentStatus, AssignmentStatus.Graded>,
        score: null,
      };
    }
  } else {
    return {
      ...baseAssignment,
      status: AssignmentStatus.Ungraded,
      score: null,
    };
  }
  return {
    ...baseAssignment,
    status: AssignmentStatus.Ungraded,
    score: null,
  };
}
export function parseSubjectAssignments({
  responses,
  params: { id },
}: ParserFunctionArguments<"subjectAssignments">): {
  subjectId: string;
  assignments: Assignment[];
  terms: TermEntry[] | null;
  currentTermIndex: number | null;
} | null {
  const [termsData, assignmentsSegments] = responses.slice(-2) as [
    OpenAPI200JSONResponse<"/aspen/rest/studentSchedule/{subjectOid}/gradeTerms">,
    Array<
      | OpenAPI200JSONResponse<"/aspen/rest/studentSchedule/{subjectOid}/categoryDetails/pastDue">
      | OpenAPI200JSONResponse<"/aspen/rest/studentSchedule/{subjectOid}/categoryDetails/upcoming">
    >,
  ];

  const preparedAssignments = assignmentsSegments
    .flat()
    .sort((a, b) => b.dueDate - a.dueDate)
    .map(convertAssignment);
  const { terms, currentTermIndex } = termsData;
  const preparedTerms = terms
    .filter((item) => item.gradeTermId !== "Term")
    .map((item) => ({
      id: item.oid,
      name: item.gradeTermId,
    }));
  return {
    subjectId: id,
    assignments: preparedAssignments,
    terms: assignmentsSegments.length === 1 ? preparedTerms : null,
    currentTermIndex:
      preparedTerms.length === terms.length ? currentTermIndex || null : null,
  };
}
export function parseSubjectAssignment({
  responses,
}: ParserFunctionArguments<"subjectAssignment">): Assignment | null {
  const assignment =
    responses[0] as OpenAPI200JSONResponse<"/aspen/rest/students/{studentOid}/assignments/{assignmentOid}">;
  return convertAssignment(assignment);
}
export function parseAssignmentFileSubmissionState({
  responses,
}: ParserFunctionArguments<"assignmentFileSubmissionState">): AssignmentSubmissionState {
  const $ = responses.at(-1)!;
  const $container = $('[class="submissionItemDropTarget"]'); //exact selector match
  if ($container.children().length === 0) {
    return {
      isAllowed: false,
      isOpen: false,
    };
  }
  const $submitButton = $container.find("#submitButton");
  const isOpen = $submitButton.length > 0;
  const $nameSpan = $container.find(
    'span[onclick^="javascript:downloadSubmission"]'
  );
  let file: AssignmentSubmissionFile | undefined;
  if ($nameSpan.length > 0) {
    const id = $nameSpan.attr("onclick")?.split("'")[1];
    const submittedAt = locallyTimezonedDayJS(
      $nameSpan.text().split(/[()]/)[1],
      "M/D/YYYY h:mm A"
    ).toDate();
    let name: string;
    $nameSpan.contents().filter(function () {
      if (this.nodeType === 8 && this.nodeValue.startsWith("\nUncomment")) {
        name = this.nodeValue.split("\n")[2]!;
      }
      return true;
    });

    file = {
      id: id!,
      name: name!,
      submittedAt,
    };
  }

  return {
    isAllowed: true,
    file,
    isOpen,
  };
}
