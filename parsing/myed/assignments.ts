import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment, AssignmentStatus } from "@/types/school";
import { getDataTableHeaderAndRows$ } from "./helpers";
import { ParserFunctionArguments } from "./types";
const tableColumnsNameToKey = {
  AssignmentName: "name",
  DateAsgn: "assignedAt",
  DateDue: "dueAt",
  Score: "scoreBlock",
  "Assignment feedback": "feedback",
  "Assignment Weight": "weight",
} as const;
type TableColumnsNameToKey = typeof tableColumnsNameToKey;
const convertTextToDate = (text: string) =>
  timezonedDayJS(text, "DD/MM/YYYY").toDate();
const scoreBarTextToStatus: Record<string, AssignmentStatus> = {
  NHI: AssignmentStatus.Missing,
  REC: AssignmentStatus.Exempt,
  Ungraded: AssignmentStatus.Ungraded,
};
const DEFAULT_COLUMNS_INDEXES = {
  name: 1,
  assignedAt: 2,
  dueAt: 3,
  weight: -1,
  scoreBlock: -1,
  feedback: -1,
};
export function parseSubjectAssignments(
  ...[, , , $]: ParserFunctionArguments<"subjectAssignments">
): Assignment[] | null {
  const table = getDataTableHeaderAndRows$($);
  if (!table) return [];
  const columnsIndexes: Record<
    TableColumnsNameToKey[keyof TableColumnsNameToKey],
    number
  > = {
    ...DEFAULT_COLUMNS_INDEXES,
  };
  $(table.header)
    .children(":not(:first-child)")
    .each((i, th) => {
      const textContent = $(th).text().trim();
      const key =
        tableColumnsNameToKey[textContent as keyof TableColumnsNameToKey];
      if (!key) return;
      columnsIndexes[key] = i + 1; //skipping checkbox
    });
  const data = table.rows.map((row) => {
    const cells = $(row).children("td").toArray();
    let score = null,
      maxScore = null,
      status = AssignmentStatus.Unknown;

    const scoreBlockCells = $(cells[columnsIndexes.scoreBlock]).find("td");
    if (scoreBlockCells.length > 0) {
      const scoreBarCellText = scoreBlockCells.first().text();
      if (scoreBarCellText) {
        const foundStatus = scoreBarTextToStatus[scoreBarCellText];
        if (foundStatus) {
          status = foundStatus;
        }
      }
      const scoreValuesCell = scoreBlockCells.last().prev();

      if ($(scoreValuesCell).length > 0) {
        if (status === AssignmentStatus.Unknown)
          status = AssignmentStatus.Graded;
        [score, maxScore] = $(scoreValuesCell).text().split(" / ").map(Number);
      }
    }
    return {
      name: $(cells[columnsIndexes.name]).text().trim(),
      dueAt: convertTextToDate($(cells[columnsIndexes.dueAt]).text().trim()),
      weight:
        columnsIndexes.weight > -1
          ? +$(cells[columnsIndexes.weight]).text().trim()
          : undefined,
      score,
      maxScore,
      status,
      assignedAt: convertTextToDate(
        $(cells[columnsIndexes.assignedAt]).text().trim()
      ),
      feedback: $(cells[columnsIndexes.feedback]).text().trim() ?? null,
    };
  });
  return data;
}
