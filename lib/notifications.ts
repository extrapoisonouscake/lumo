import { Assignment } from "@/types/school";

export const prepareAssignmentForDBStorage = (assignment: Assignment) => ({
  id: assignment.id,
  score: typeof assignment.score === "number" ? assignment.score : undefined,
});
