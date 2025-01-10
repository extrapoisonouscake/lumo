import { ErrorCard } from "@/components/misc/error-card";
import { getUserSettings } from "@/lib/settings/queries";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import { convertPathParameterToSubjectName } from "./helpers";
import { SubjectAssignmentsTable } from "./table";
interface Props {
  params: { name: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: convertPathParameterToSubjectName(params.name) };
}
export default async function Page({ params }: Props) {
  const subjectName = params.name.replaceAll("_", " ");
  const [
    { shouldShowAssignmentScorePercentage, shouldHighlightMissingAssignments },
    data,
  ] = await Promise.all([
    getUserSettings(),
    fetchMyEd("subjectAssignments", { name: subjectName }),
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
