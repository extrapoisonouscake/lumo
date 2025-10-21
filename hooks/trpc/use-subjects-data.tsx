import { RouterInput } from "@/lib/trpc/types";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useCachedQuery } from "../use-cached-query";
export function useSubjectsData(
  {
    isPreviousYear,
    termId,
  }: {
    isPreviousYear: boolean;
    termId?: string;
  } = { isPreviousYear: false, termId: undefined }
) {
  const params: RouterInput["myed"]["subjects"]["getSubjects"] = {
    isPreviousYear,
    termId,
  };
  //@ts-expect-error fix later
  const options = getTRPCQueryOptions(trpc.myed.subjects.getSubjects)(params);
  const query = useCachedQuery({
    ...options,
    select: (data) => {
      const customization = data.customization;

      if (customization?.subjectsListOrder) {
        data.subjects.main.sort((a, b) => {
          const aIndex = customization.subjectsListOrder.indexOf(a.id);
          const bIndex = customization.subjectsListOrder.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      }
      return data;
    },
  });

  return { ...query, queryKey: options.queryKey };
}
export function useSubjectData({
  id,
  ...rest
}: { id: string } & Parameters<typeof useSubjectsData>[0]) {
  const query = useSubjectsData(rest);

  const subject = query.data?.subjects.main.find((s) => s.id === id);
  return { ...query, data: subject };
}
