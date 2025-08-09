import { Assignment } from "@/types/school";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { getAssignmentURL } from "./helpers";

export function useAssignmentNavigation() {
  const { subjectId, subjectName } = useParams();
  const router = useRouter();

  const navigateToAssignment = (assignment: Assignment) => {
    router.push(
      getAssignmentURL(assignment, {
        id: subjectId as string,
        name: subjectName as string,
      })
    );
  };

  return { navigateToAssignment };
}
