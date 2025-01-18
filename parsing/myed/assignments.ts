import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment, AssignmentStatus } from "@/types/school";
import { getDataTableHeaderAndRows$ } from "./helpers";
import { OpenAPI200JSONResponse, ParserFunctionArguments } from "./types";

const scoreLabelToStatus: Record<string, AssignmentStatus> = {
  NHI: AssignmentStatus.Missing,
  REC: AssignmentStatus.Exempt,
  Ungraded: AssignmentStatus.Ungraded,
};

export function parseSubjectAssignments(
  ...[, pastDue, upcoming]: ParserFunctionArguments<'subjectAssignments',[OpenAPI200JSONResponse<'/studentSchedule/{subjectOid}/categoryDetails/pastDue'>,OpenAPI200JSONResponse<'/studentSchedule/{subjectOid}/categoryDetails/upcoming'>]>
): Assignment[] | null {
  const allAssignments=[...pastDue,...upcoming]
  return allAssignments.map(({name,dueDate,assignedDate,classAverage,scoreElements,remark,})=>{
    const {scoreLabel,score,pointMax}=scoreElements[0]
    return {
      name,
  dueAt: new Date(dueDate),
  assignedAt: new Date(assignedDate),
  classAverage: +classAverage.split(' ')[0]??null,
  feedback: remark??null,
  status: scoreLabel?scoreLabelToStatus[scoreLabel]:AssignmentStatus.Unknown,
  score: score?+score:null,
  maxScore: pointMax?+pointMax:null,
    }
  })
}

