import { trpc } from "@/app/trpc";
import { Assignment, Subject } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
export function useSubjectAssignment(
  subjectId: Subject["id"],
  assignmentId: Assignment["id"]
) {
  return useQuery(
    trpc.subjects.getSubjectAssignment.queryOptions({ subjectId, assignmentId })
  );
}
