import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";

export function useStudentDetails() {
  return useQuery(trpc.myed.user.getStudentDetails.queryOptions());
}
