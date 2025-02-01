import { ErrorCard } from "@/components/misc/error-card";
import { getUserSettings } from "@/lib/settings/queries";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { convertPathParameterToSubjectName } from "./helpers";
import { SubjectAssignmentsTable } from "./table";
import { SubjectPageContent } from "./content";
interface Props {
  params: { slug: [string, string] };
}

export async function generateMetadata({ params }: Props) {
  const subjectName = convertPathParameterToSubjectName(params.slug[0]);
  return { title: subjectName };
}
export default async function Page({ params }: Props) {
  const [subjectName, subjectId] = params.slug;
  const [
    { shouldShowAssignmentScorePercentage, shouldHighlightMissingAssignments },
    data,
  ] = await Promise.all([
    getUserSettings(),
    getMyEd("subjectAssignments", {
      subjectName: subjectName.replaceAll("_", " "),
      subjectId,
    }),
  ]);
  if (!data) return <ErrorCard />;
  return (
    <SubjectPageContent {...data} shouldShowAssignmentScorePercentage={shouldShowAssignmentScorePercentage} shouldHighlightMissingAssignments={shouldHighlightMissingAssignments} />
  );
}
