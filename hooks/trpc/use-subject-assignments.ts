import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
import { Subject, SubjectTerm } from "../../types/school";
export function useSubjectAssignments(props: {
  id: Subject["id"];
  termId?: string;
  term?: SubjectTerm;
}) {
  return useQuery({
    ...getTRPCQueryOptions(trpc.myed.subjects.getSubjectAssignments)(props),
    enabled: !!props.term,
  });
}
