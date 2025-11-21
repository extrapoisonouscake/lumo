import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { prepareStringForURI } from "@/helpers/prepareStringForURI";
import { UserSettings } from "@/types/core";
import { Assignment, AssignmentStatus, Subject } from "@/types/school";

export function getPercentageString(score: number, maxScore: number): string {
  const percentage = +(score / (maxScore / 100)).toFixed(1);
  return ` (${percentage}%)`;
}
export const ASSIGNMENT_STATUS_LABELS = {
  [AssignmentStatus.Graded]: "Graded",
  [AssignmentStatus.Missing]: "Overdue",
  [AssignmentStatus.Exempt]: "Exempt",
  [AssignmentStatus.Ungraded]: "Ungraded",
};
/**
 * Formats the assignment score based on the assignment status and user settings
 */
export function formatAssignmentScore(
  shouldShowPercentages: UserSettings["shouldShowPercentages"]
) {
  return function (assignment: Assignment): string {
    switch (assignment.status) {
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
  assignment: Assignment,
  subject: Pick<Subject, "id"> & { name: Pick<Subject["name"], "prettified"> }
): string {
  return `/classes/${prepareStringForURI(subject.name.prettified)}/${subject.id}/assignments/${assignment.id}`;
}
