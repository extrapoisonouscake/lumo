import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment } from "@/types/school";
import { ParserFunctionArguments } from "./types";

export function parseSubjectAssignments(
  ...[, , , $]: ParserFunctionArguments<"subjectAssignments">
): Assignment[] | null {
  const $tableContainer = $("#dataGrid");
  if ($tableContainer.length === 0) return null;

  if ($tableContainer.find(".listNoRecordsText").length > 0) return null;
  const data = $tableContainer
    .find(".listCell")
    .toArray()
    .map((cell) => {
      const texts = $(cell).children("td").toArray();
      let score = null,
        maxScore = null;
      const scoreCell = $(texts[5]).find("td:nth-child(2)");
      console.log(scoreCell.text());
      if (scoreCell.length > 0) {
        [score, maxScore] = scoreCell.text().split(" / ").map(Number);
      }
      return {
        name: $(texts[1]).text().trim(),
        dueDate: timezonedDayJS(
          $(texts[3]).text().trim(),
          "DD/MM/YYYY"
        ).toDate(),
        score,
        maxScore,
      };
    });
  return data;
}
