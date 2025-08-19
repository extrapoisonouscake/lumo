import { trpc } from "@/app/trpc";
import { Subject, SubjectYear } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
export function useSubjectSummary(id: Subject["id"], year: SubjectYear) {
  return useQuery(trpc.myed.subjects.getSubjectInfo.queryOptions({ id, year }));
}
