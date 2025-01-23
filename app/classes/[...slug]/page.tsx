import { ErrorCard } from "@/components/misc/error-card";
import { getUserSettings } from "@/lib/settings/queries";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import { convertPathParameterToSubjectName } from "./helpers";
import { SubjectAssignmentsTable } from "./table";
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
    fetchMyEd("subjectAssignments", {
      subjectName: subjectName.replaceAll("_", " "),
      subjectId,
    }),
  ]);
  if (!data) return <ErrorCard />;
  return (
    <SubjectAssignmentsTable
      shouldShowAssignmentScorePercentage={shouldShowAssignmentScorePercentage}
      shouldHighlightMissingAssignments={shouldHighlightMissingAssignments}
      data={data}
    />
  );
}
