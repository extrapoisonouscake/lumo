import { Assignment, AssignmentStatus } from "@/types/school";
import { OpenAPI200JSONResponse, ParserFunctionArguments } from "./types";

const scoreLabelToStatus: Record<string, AssignmentStatus> = {
  NHI: AssignmentStatus.Missing,
  REC: AssignmentStatus.Exempt,
  Ungraded: AssignmentStatus.Ungraded,
};

export function parseSubjectAssignments(
  ...[, ...responses]: ParserFunctionArguments<
    "subjectAssignments"
  >
): Assignment[] | null {
  console.log(responses)
  const [pastDue, upcoming] = responses.at(-1) as [
    OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/categoryDetails/pastDue">,
    OpenAPI200JSONResponse<"/studentSchedule/{subjectOid}/categoryDetails/upcoming">
  ];
  const allAssignments = [...pastDue, ...upcoming];
  return allAssignments.map(
    ({ name, dueDate, assignedDate, classAverage, scoreElements, remark }) => {
      const { scoreLabel, score, pointMax } = scoreElements[0];
      let status = AssignmentStatus.Unknown;
      if (score && score !== 'NaN') {
        status = AssignmentStatus.Graded;
      }
      if (status === AssignmentStatus.Unknown && scoreLabel) {
        status = scoreLabelToStatus[scoreLabel];
      }
      return {
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
  );
}
