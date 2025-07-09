import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { UserSettings } from "@/types/core";
import { Assignment, AssignmentStatus } from "@/types/school";

function getPercentageString(score: number, maxScore: number): string {
  const percentage = +(score / (maxScore / 100)).toFixed(1);
  return ` (${percentage}%)`;
}
export const ASSIGNMENT_STATUS_LABELS = {
  [AssignmentStatus.Graded]: "Graded",
  [AssignmentStatus.Missing]: "Missing",
  [AssignmentStatus.Exempt]: "Exempt",
  [AssignmentStatus.Ungraded]: "Ungraded",
  [AssignmentStatus.Unknown]: "Unknown",
};
/**
 * Formats the assignment score based on the assignment status and user settings
 */
export function formatAssignmentScore(
  shouldShowPercentages: UserSettings["shouldShowPercentages"]
) {
  return function (assignment: Assignment): string {
    switch (assignment.status) {
      case AssignmentStatus.Unknown:
        return NULL_VALUE_DISPLAY_FALLBACK;
      case AssignmentStatus.Graded:
        return formatScore(shouldShowPercentages)(assignment, "score");
      case AssignmentStatus.Missing:
      case AssignmentStatus.Exempt:
      case AssignmentStatus.Ungraded:
        return ASSIGNMENT_STATUS_LABELS[assignment.status];
      default:
        return NULL_VALUE_DISPLAY_FALLBACK;
    }
  };
}

/**
 * Formats the class average for an assignment
 */
export function formatScore(
  shouldShowPercentages: UserSettings["shouldShowPercentages"]
) {
  return function (assignment: Assignment, key: keyof Assignment): string {
    const { maxScore } = assignment;
    const value = assignment[key];
    if (typeof value !== "number") {
      return NULL_VALUE_DISPLAY_FALLBACK;
    }

    let baseString = `${value} / ${maxScore}`;
    if (shouldShowPercentages) {
      baseString += getPercentageString(value, maxScore);
    }
    return baseString;
  };
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
