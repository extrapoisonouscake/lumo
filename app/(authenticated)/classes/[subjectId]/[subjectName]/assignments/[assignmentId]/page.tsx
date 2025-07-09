import { AssignmentPageContent } from "./content";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ subjectId: string; assignmentId: string }>;
}) {
  const { subjectId, assignmentId } = await params;
  return (
    <AssignmentPageContent subjectId={subjectId} assignmentId={assignmentId} />
  );
}
