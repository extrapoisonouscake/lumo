import { ErrorCard } from "@/components/misc/error-card";
import { getUserSettings } from "@/lib/settings/queries";
import { fetchMyEd } from "@/parsing/myed/fetchMyEd";
import { SubjectAssignmentsTable } from "./table";
interface Props {
  params: { name: string };
}
export default async function Page({ params }: Props) {
  const subjectName = params.name.replaceAll("_", " ");
  const [{ shouldShowAssignmentScorePercentage }, data] = await Promise.all([
    getUserSettings(),
    fetchMyEd("subjectAssignments", { name: subjectName }),
  ]);
  console.log({ data });
  if (!data) return <ErrorCard />;
  return (
    <SubjectAssignmentsTable
      shouldShowAssignmentScorePercentage={shouldShowAssignmentScorePercentage}
      data={data}
    />
  );
}
