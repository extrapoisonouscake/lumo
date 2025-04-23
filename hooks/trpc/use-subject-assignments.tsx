import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectAssignments(id: string, termId?: string) {
  return useQuery(
    trpc.subjects.getSubjectAssignments.queryOptions({ id, termId })
  );
}
