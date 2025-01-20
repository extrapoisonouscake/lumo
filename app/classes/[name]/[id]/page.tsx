import { ErrorCard } from "@/components/misc/error-card";
import { getUserSettings } from "@/lib/settings/queries";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import { convertPathParameterToSubjectName } from "./helpers";
import { SubjectAssignmentsTable } from "./table";
interface Props {
  params: { name: string, id: string };
}

export async function generateMetadata({ params }: Props) {
  return { title: convertPathParameterToSubjectName(params.name) };
}
export default async function Page({ params }: Props) {

  const [
    { shouldShowAssignmentScorePercentage, shouldHighlightMissingAssignments },
    data,
  ] = await Promise.all([
    getUserSettings(),
    //@ts-expect-error FIX THIS
    fetchMyEd("subjectAssignments", { subjectID: params.id, }),
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
