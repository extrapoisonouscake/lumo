import { Assignment, Subject } from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectAssignment(
  subjectId: Subject["id"],
  assignmentId: Assignment["id"]
) {
  return useQuery(
    getTRPCQueryOptions(trpc.myed.subjects.getSubjectAssignment)({
      subjectId,
      assignmentId,
    })
  );
}
