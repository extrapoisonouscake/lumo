import { trpc } from "@/app/trpc";
import { useMutation } from "@tanstack/react-query";

export function useUpdateUserSetting() {
  const mutation = useMutation(trpc.user.updateUserSetting.mutationOptions());
  return mutation;
}
