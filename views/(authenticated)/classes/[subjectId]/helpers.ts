import { Assignment, AssignmentStatus, SubjectSummary } from "@/types/school";
export enum Outcome {
  Achievable = "achievable",
  AlreadyAchieved = "already-achieved",
  ValuesOutOfRange = "values-out-of-range",
  Unknown = "unknown",
}
function computeGoalStatusResult({
  assignments,
  categories,
  currentAverage,
  desiredAverage,
  minimumScore,
  categoryId,
}: {
  assignments: Assignment[];
  categories: SubjectSummary["academics"]["categories"];
  currentAverage: number;
  desiredAverage: number;
  minimumScore: number;
  categoryId: string;
}) {
  // Convert string values to numbers for calculations

  const categoryAssignmentsCount = assignments.filter(
    (assignment) =>
      assignment.status === AssignmentStatus.Graded &&
      assignment.categoryId === categoryId
  ).length;
  const category = categories.find((cat) => cat.id === categoryId);
  if (!category) return { outcome: Outcome.Unknown };
  const categoryWeight = category.derivedWeight;
  if (!categoryWeight) return { outcome: Outcome.Unknown };
  const categoryWeightPercentage = categoryWeight / 100;
  const categoryAverage = category.average?.mark ?? 100;
  const numerator =
    (categoryAssignmentsCount * (currentAverage - desiredAverage)) /
    categoryWeightPercentage;
  const denominator =
    categoryAverage -
    minimumScore +
    (desiredAverage - currentAverage) / categoryWeightPercentage;
  if (numerator >= 0) return { outcome: Outcome.AlreadyAchieved };
  if (denominator > 0) {
    return { outcome: Outcome.ValuesOutOfRange };
  }
  const minimumThreshold =
    categoryAverage +
    (desiredAverage - currentAverage) / categoryWeightPercentage;

  // Maximum achievable total average if all future assignments are 100%
  const maxAchievable =
    currentAverage + categoryWeightPercentage * (100 - categoryAverage);
  if (desiredAverage > maxAchievable || minimumScore < minimumThreshold)
    return { outcome: Outcome.ValuesOutOfRange };
  const neededAssignmentsCount = Math.ceil(numerator / denominator);

  if (neededAssignmentsCount > 10) return { outcome: Outcome.ValuesOutOfRange };
  return {
    outcome: Outcome.Achievable,
    neededAssignmentsCount: neededAssignmentsCount,
  };
}
export function computeGoalStatus({
  assignments,
  categories,
  currentAverage,
  desiredAverage,
  minimumScore,
  categoryId,
}: Parameters<typeof computeGoalStatusResult>[0]) {
  const result = computeGoalStatusResult({
    assignments,
    categories,
    currentAverage,
    desiredAverage,
    minimumScore,
    categoryId,
  });
  const isCalculated =
    result.outcome !== Outcome.Unknown && desiredAverage !== currentAverage;
  const isAchievable =
    isCalculated && result.outcome !== Outcome.ValuesOutOfRange;
  return {
    ...result,
    isCalculated,
    isAchievable,
  };
}
