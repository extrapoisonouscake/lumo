import { Assignment } from "@/types/school";
import { useNavigate, useParams } from "react-router";
import { getAssignmentURL } from "./helpers";

export function useAssignmentNavigation() {
  const { subjectId, subjectName } = useParams();
  const navigate = useNavigate();

  const navigateToAssignment = (assignment: Assignment) => {
    navigate(
      getAssignmentURL(assignment, {
        id: subjectId as string,
        name: { prettified: subjectName as string },
      })
    );
  };

  return { navigateToAssignment };
}
