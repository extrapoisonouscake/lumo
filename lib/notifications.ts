import { TrackedSubject } from "@/db/schema";

export const prepareAssignmentForDBStorage = ({
  id,
  score,
  updatedAt,
}: TrackedSubject["assignments"][number]) => ({
  id,
  score,
  updatedAt,
});
