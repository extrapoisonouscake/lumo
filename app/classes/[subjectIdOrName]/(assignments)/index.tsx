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
  const settings = getUserSettings();
  const assignments = await getMyEd("subjectAssignments", {
    id,
    termId,
  });
  return (
    <SubjectAssignmentsContent
      {...assignments}
      term={termId}
      settings={settings}
    />
  );
}
