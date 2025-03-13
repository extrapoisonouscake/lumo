import { TitleManager } from "@/components/misc/title-manager";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Metadata } from "next";
import { Suspense } from "react";
import { TermSearchParams } from "../page";
import { SubjectAssignments } from "./(assignments)";
import { SubjectAssignmentsSkeleton } from "./(assignments)/content";
import { SubjectSummary } from "./summary";
export const metadata: Metadata = {
  title: "Loading...",
};
export default async function SubjectPage({
  searchParams: { term },
  params: { subjectIdOrName },
}: {
  params: { subjectIdOrName: string };
  searchParams: Pick<TermSearchParams, "term">;
}) {
  const isQueryParamId = !subjectIdOrName.startsWith("n_");

  let subjectId = isQueryParamId ? subjectIdOrName : undefined;
  if (!subjectId) {
    subjectId = await getMyEd("subjectIdByName", {
      name: subjectIdOrName,
    });
  }

  const summary = await getMyEd("subjectSummary", {
    id: subjectId,
  });

  return (
    <>
      <TitleManager title={summary.name} />
      <SubjectSummary {...summary} />
      <Suspense fallback={<SubjectAssignmentsSkeleton />}>
        <SubjectAssignments id={summary.id} termId={term} />
      </Suspense>
    </>
  );
}
