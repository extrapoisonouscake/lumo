import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";

export function usePersonalDetails() {
  return useQuery(trpc.user.getPersonalDetails.queryOptions());
}
