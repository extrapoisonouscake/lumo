import { getMyEd } from "@/parsing/myed/getMyEd";

export default async function AssignmentPageComponent({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const assignment = await getMyEd("subjectAssignment", {
    assignmentId,
  });
  return (
    <>
      <div>
        <h2 className="text-xl font-semibold">{assignment?.name}</h2>
      </div>
    </>
  );
}
