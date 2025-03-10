import { getMyEd } from "@/parsing/myed/getMyEd";
import { SubjectPageContent } from "./content";

import { ErrorCard } from "@/components/misc/error-card";
import { getUserSettings } from "@/lib/settings/queries";

export default async function SubjectPageComponent({
  subjectName,
  subjectId,
  term,
}: {
  subjectName: string;
  subjectId?: string;
  term?: string;
}) {
  const [
    { shouldShowAssignmentScorePercentage, shouldHighlightMissingAssignments },
    data,
  ] = await Promise.all([
    getUserSettings(),
    getMyEd("subjectAssignments", {
      subjectName: subjectName.replaceAll("_", " "),
      subjectId,
      termOid: term,
    }),
  ]);
  if (!data) return <ErrorCard />;
  return (
    <SubjectPageContent
      subjectName={subjectName}
      term={term}
      {...data}
      shouldShowAssignmentScorePercentage={shouldShowAssignmentScorePercentage}
      shouldHighlightMissingAssignments={shouldHighlightMissingAssignments}
    />
  );
}
