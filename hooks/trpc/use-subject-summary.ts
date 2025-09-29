import { Subject, SubjectYear } from "@/types/school";
import { trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectSummary(id: Subject["id"], year: SubjectYear) {
  return useQuery(trpc.myed.subjects.getSubjectInfo.queryOptions({ id, year }));
}
