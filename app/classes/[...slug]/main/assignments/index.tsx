import { getUserSettings } from "@/lib/settings/queries";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { SubjectAssignmentsContent } from "./content";

export async function SubjectAssignments({
  id,
  termId,
}: {
  id: string;
  termId?: string;
}) {
  const [userSettings, assignments] = await Promise.all([
    getUserSettings(),
    getMyEd("subjectAssignments", {
      id,
      termId,
    }),
  ]);
  return (
    <SubjectAssignmentsContent
      {...assignments}
      subjectId={id}
      term={termId}
      settings={userSettings}
    />
  );
}
