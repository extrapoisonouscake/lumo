import { prettifyEducationalName } from "@/helpers/prettifyEducationalName";
import { components } from "@/types/myed-rest";
import { Assignment, AssignmentStatus, TermEntry } from "@/types/school";
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
    const { scoreLabel, score, pointMax } = scoreElement;

    if (score && score !== "NaN") {
      return {
        ...baseAssignment,
        status: AssignmentStatus.Graded,
        score: +score,
      };
    } else if (scoreLabel) {
      const status = scoreLabelToStatus[scoreLabel] ?? AssignmentStatus.Unknown;
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
    status: AssignmentStatus.Unknown,
    score: null,
  };
}
export function parseSubjectAssignments({
  responses,
  metadata,
}: ParserFunctionArguments<"subjectAssignments">): {
  subjectId?: string;
  assignments: Assignment[];
  terms: TermEntry[] | null;
  currentTermIndex: number | null;
} | null {
  const [termsData, assignmentsSegments] = responses.slice(-2) as [
    OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/gradeTerms">,
    Array<
      | OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/categoryDetails/pastDue">
      | OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/categoryDetails/upcoming">
    >
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
    responses[0] as OpenAPI200JSONResponse<"/students/{studentOid}/assignments/{assignmentOid}">;
  return convertAssignment(assignment);
}
