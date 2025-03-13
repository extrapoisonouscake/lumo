import { TitleManager } from "@/components/misc/title-manager";
import { getUserSettings } from "@/lib/settings/queries";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Metadata } from "next";
import { Suspense } from "react";
import { TermSearchParams } from "../page";
import { SubjectAssignments } from "./(assignments)";
import { SubjectAssignmentsSkeleton } from "./(assignments)/content";
import { SubjectNameReplacer } from "./subject-name-replacer";
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
      name: decodeURIComponent(subjectIdOrName.slice(2)),
    });
  }

  const [summary, settings] = await Promise.all([
    getMyEd("subjectSummary", {
      id: subjectId,
    }),
    getUserSettings(),
  ]);

  return (
    <>
      <TitleManager title={summary.name} />
      <SubjectNameReplacer id={summary.id} />
      <SubjectSummary
        {...summary}
        shouldShowLetterGrade={settings.shouldShowLetterGrade}
      />
      <Suspense fallback={<SubjectAssignmentsSkeleton />}>
        <SubjectAssignments id={summary.id} termId={term} />
      </Suspense>
    </>
  );
}
