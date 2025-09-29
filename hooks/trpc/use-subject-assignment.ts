import { Assignment, Subject } from "@/types/school";
import { trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectAssignment(
  subjectId: Subject["id"],
  assignmentId: Assignment["id"]
) {
  return useQuery(
    trpc.myed.subjects.getSubjectAssignment.queryOptions({
      subjectId,
      assignmentId,
    })
  );
}
