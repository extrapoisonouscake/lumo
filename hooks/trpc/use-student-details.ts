import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";

export function useStudentDetails({ enabled }: { enabled?: boolean } = {}) {
  return useQuery({
    ...trpc.myed.user.getStudentDetails.queryOptions(),
    enabled,
  });
}
