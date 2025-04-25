import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectAssignments(id: string, termId?: string) {
  return useQuery(
    trpc.myed.subjects.getSubjectAssignments.queryOptions({ id, termId })
  );
}
