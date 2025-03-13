import { TitleManager } from "@/components/misc/TItleManager";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Loading...",
};
export default async function AssignmentPage({
  params: { assignmentId },
}: {
  params: { assignmentId: string };
}) {
  const assignment = await getMyEd("subjectAssignment", {
    assignmentId,
  });
  return (
    <>
      <TitleManager title={assignment.name} />
      <div>
        <h2 className="text-xl font-semibold">{assignment.name}</h2>
      </div>
    </>
  );
}
