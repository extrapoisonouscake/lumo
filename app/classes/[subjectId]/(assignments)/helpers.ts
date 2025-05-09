import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { UserSettings } from "@/types/core";
import { Assignment, AssignmentStatus } from "@/types/school";

function getPercentageString(score: number, maxScore: number): string {
  const percentage = +(score / (maxScore / 100)).toFixed(1);
  return ` (${percentage}%)`;
}

/**
 * Formats the assignment score based on the assignment status and user settings
 */
export function formatAssignmentScore(
  assignment: Assignment,
  shouldShowPercentages: UserSettings["shouldShowPercentages"]
): string {
  const { status, score, maxScore } = assignment;

  switch (status) {
    case AssignmentStatus.Unknown:
      return NULL_VALUE_DISPLAY_FALLBACK;
    case AssignmentStatus.Graded: {
      let scoreValues = `${score} / ${maxScore}`;
      if (shouldShowPercentages) {
        scoreValues += getPercentageString(score, maxScore);
      }

      return scoreValues;
    }
    case AssignmentStatus.Missing:
      return `Missing`;
    case AssignmentStatus.Exempt:
      return "Exempt";
    case AssignmentStatus.Ungraded:
      return "Ungraded";
    default:
      return NULL_VALUE_DISPLAY_FALLBACK;
  }
}
const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
/**
 * Formats the class average for an assignment
 */
export function formatClassAverage(
  assignment: Assignment,
  shouldShowPercentages: UserSettings["shouldShowPercentages"]
): string {
  const { classAverage, maxScore } = assignment;

  if (typeof classAverage !== "number") {
    return NULL_VALUE_DISPLAY_FALLBACK;
  }

  let baseString = `${classAverage} / ${maxScore}`;
  if (shouldShowPercentages) {
    baseString += getPercentageString(classAverage as number, maxScore);
  }
  return baseString;
}

/**
 * Constructs the URL for an assignment
 */
export function getAssignmentURL(
  pathname: string,
  assignment: Assignment
): string {
  return `${pathname}/assignments/${assignment.id}`;
}
