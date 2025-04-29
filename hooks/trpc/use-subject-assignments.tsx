import { trpc } from "@/app/trpc";
import { useQuery } from "@tanstack/react-query";
import { Subject, SubjectTerm } from "../../types/school";
export function useSubjectAssignments(props: {
  id: Subject["id"];
  termId?: string;
  term?: SubjectTerm;
}) {
  return useQuery({
    ...trpc.myed.subjects.getSubjectAssignments.queryOptions(props),
    enabled: !!props.term,
  });
}
