import { getUserSettings } from "@/lib/settings/queries";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { SubjectSummary } from "@/types/school";
import { SubjectAssignmentsContent } from "./content";

export async function SubjectAssignments({
  id,
  termId,
  categoryId,
  categories,
}: {
  id: string;
  termId: string | undefined;
  categoryId: string | undefined;
  categories: SubjectSummary["academics"]["categories"];
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
      categories={categories}
      categoryId={categoryId || "all"}
    />
  );
}
