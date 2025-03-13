import { TitleManager } from "@/components/misc/title-manager";
import { getUserSettings } from "@/lib/settings/queries";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Metadata } from "next";
import { Suspense } from "react";
import { setTimeout } from "timers/promises";
import { TermSearchParams } from "../page";
import { SubjectAssignments } from "./(assignments)";
import { SubjectAssignmentsSkeleton } from "./(assignments)/content";
import { SubjectNameReplacer } from "./subject-name-replacer";
import { SubjectSummary } from "./summary";
export const metadata: Metadata = {
  title: "Loading...",
};

export interface SubjectPageProps {
  searchParams: Pick<TermSearchParams, "term">;
  params: { subjectIdOrName: string };
}

export default async function SubjectPage({
  searchParams: { term },
  params: { subjectIdOrName },
}: SubjectPageProps) {
  const isQueryParamId = !subjectIdOrName.startsWith("n_");

  let subjectId = isQueryParamId ? subjectIdOrName : undefined;
  if (!subjectId) {
    subjectId = await getMyEd("subjectIdByName", {
      name: decodeURIComponent(subjectIdOrName.slice(2)),
    });
  }
  const settings = getUserSettings();
  const summary = await getMyEd("subjectSummary", {
    id: subjectId,
  });
  await setTimeout(1000);
  return (
    <>
      <TitleManager title={summary.name} />
      <SubjectNameReplacer id={summary.id} newName={summary.name} />
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
