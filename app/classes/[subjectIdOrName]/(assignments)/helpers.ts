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
  shouldShowAssignmentScorePercentage: UserSettings["shouldShowAssignmentScorePercentage"]
): string {
  const { status, score, maxScore } = assignment;

  switch (status) {
    case AssignmentStatus.Unknown:
      return NULL_VALUE_DISPLAY_FALLBACK;
    case AssignmentStatus.Graded: {
      let scoreValues = `${score} / ${maxScore}`;
      if (shouldShowAssignmentScorePercentage) {
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

/**
 * Formats the class average for an assignment
 */
export function formatClassAverage(assignment: Assignment): string {
  const { classAverage } = assignment;

  if (typeof classAverage !== "number") {
    return NULL_VALUE_DISPLAY_FALLBACK;
  }
  const maxScore = assignment.maxScore as NonNullable<Assignment["maxScore"]>;
  return `${classAverage} / ${maxScore}${getPercentageString(
    classAverage,
    maxScore
  )}`;
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
