import { ErrorCard } from "@/components/misc/error-card";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { SubjectAssignmentBreadcrumbHelper } from "./breadcrumb-helper";

export default async function AssignmentPageComponent({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const assignment = await getMyEd("subjectAssignment", {
    assignmentId,
  });
  if (!assignment) return <ErrorCard />;
  return (
    <>
      <SubjectAssignmentBreadcrumbHelper assignmentName={assignment.name} />
      <div>
        <h2 className="text-xl font-semibold">{assignment?.name}</h2>
      </div>
    </>
  );
}
