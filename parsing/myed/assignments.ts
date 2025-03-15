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
  assignedDate,
  classAverage,
  oid,
  scoreElements,
  remark,
  categoryOid,
}: components["schemas"]["StudentAssignment"]): Assignment {
  const { scoreLabel, score, pointMax } = scoreElements[0];
  const baseAssignment = {
    id: oid,
    name: prettifyEducationalName(name),
    dueAt: new Date(dueDate),
    assignedAt: new Date(assignedDate),
    classAverage: +classAverage.split(" ")[0] || null,
    feedback: remark ?? null,
    categoryId: categoryOid,
  };
  let status = AssignmentStatus.Unknown;
  if (score && score !== "NaN") {
    return {
      ...baseAssignment,
      status: AssignmentStatus.Graded,
      score: +score,
      maxScore: pointMax ? +pointMax : null,
    } as Assignment;
  }
  if (status === AssignmentStatus.Unknown && scoreLabel) {
    status = scoreLabelToStatus[scoreLabel] ?? AssignmentStatus.Unknown;
  }
  return {
    ...baseAssignment,
    status,
    score: null,
    maxScore: pointMax ? +pointMax : null,
  } as Assignment;
}
export function parseSubjectAssignments({
  responses,
  metadata,
}: ParserFunctionArguments<"subjectAssignments">): {
  subjectId?: string;
  assignments: Assignment[];
  terms: TermEntry[];
  currentTermIndex: number | null;
} | null {
  const [termsData, [pastDue, upcoming]] = responses.slice(-2) as [
    OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/gradeTerms">,
    [
      OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/categoryDetails/pastDue">,
      OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/categoryDetails/upcoming">
    ]
  ];
  const allAssignments = [...pastDue, ...upcoming];
  const preparedAssignments = allAssignments.map(convertAssignment);
  const { terms, currentTermIndex } = termsData;
  const preparedTerms = terms
    .filter((item) => item.gradeTermId !== "Term")
    .map((item) => ({
      id: item.oid,
      name: item.gradeTermId,
    }));
  return {
    assignments: preparedAssignments,
    terms: preparedTerms,
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
