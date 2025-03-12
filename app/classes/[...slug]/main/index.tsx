import { ErrorCard } from "@/components/misc/error-card";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Suspense } from "react";
import { SubjectSummary, SubjectSummarySkeleton } from "../summary";
import { SubjectAssignments } from "./assignments";
import { SubjectAssignmentsSkeleton } from "./assignments/content";

export default async function SubjectPageComponent({
  subjectName,
  subjectId,
  termId,
}: {
  subjectName?: string;
  subjectId?: string;
  termId?: string;
}) {
  if (!subjectName && !subjectId) {
    return <ErrorCard>No subject name or id</ErrorCard>;
  }
  const summary = await getMyEd("subject", {
    name: subjectName,
    id: subjectId,
  });
  return (
    <>
      <SubjectSummary {...summary} />
      <Suspense fallback={<SubjectAssignmentsSkeleton />}>
        <SubjectAssignments id={summary.id} termId={termId} />
      </Suspense>
    </>
  );
}
export function SubjectPageSkeleton() {
  return (
    <>
      <SubjectSummarySkeleton />
      <SubjectAssignmentsSkeleton />
    </>
  );
}
