import { trpc } from "@/app/trpc";
import { Subject } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
export function useSubjectSummary(id: Subject["id"]) {
  return useQuery(trpc.myed.subjects.getSubjectInfo.queryOptions({ id }));
}
