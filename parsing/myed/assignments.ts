import { components } from "@/types/myed-rest";
import { Assignment, AssignmentStatus, Term } from "@/types/school";
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
}: components["schemas"]["StudentAssignment"]): Assignment {
  const { scoreLabel, score, pointMax } = scoreElements[0];
  let status = AssignmentStatus.Unknown;
  if (score && score !== "NaN") {
    status = AssignmentStatus.Graded;
  }
  if (status === AssignmentStatus.Unknown && scoreLabel) {
    status = scoreLabelToStatus[scoreLabel];
  }
  return {
    id: oid,
    name,
    dueAt: new Date(dueDate),
    assignedAt: new Date(assignedDate),
    classAverage: +classAverage.split(" ")[0] || null,
    feedback: remark ?? null,
    status: status ?? AssignmentStatus.Unknown,
    score: score ? +score : null,
    maxScore: pointMax ? +pointMax : null,
  };
}
export function parseSubjectAssignments({
  responses,
  metadata,
}: ParserFunctionArguments<"subjectAssignments">): {
  subjectId?: string;
  assignments: Assignment[];
  terms: Term[];
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
    subjectId: metadata.subjectId,
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
