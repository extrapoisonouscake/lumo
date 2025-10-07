import { Subject, SubjectYear } from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
export function useSubjectSummary(id: Subject["id"], year: SubjectYear) {
  return useQuery(
    getTRPCQueryOptions(trpc.myed.subjects.getSubjectInfo)({ id, year })
  );
}
