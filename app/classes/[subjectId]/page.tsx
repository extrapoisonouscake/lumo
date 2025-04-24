"use client";
import { TitleManager } from "@/components/misc/title-manager";

import { useParams, useSearchParams } from "next/navigation";

import { QueryWrapper } from "@/components/ui/query-wrapper";
import { useSubjectAssignments } from "@/hooks/trpc/use-subject-assignments";
import { useSubjectSummary } from "@/hooks/trpc/use-subject-summary";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import {
  SubjectAssignments,
  SubjectAssignmentsSkeleton,
} from "./(assignments)";
import { SubjectSummary, SubjectSummarySkeleton } from "./summary";

export default function SubjectPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const term = searchParams.get("term") ?? undefined;
  const category = searchParams.get("category") ?? "all";
  const settings = useUserSettings();
  const summary = useSubjectSummary(subjectId);
  const assignments = useSubjectAssignments(subjectId, term);
  return (
    <>
      <QueryWrapper query={summary} skeleton={<SubjectPageSkeleton />}>
        {(summary) => (
          <>
            <TitleManager title={`${summary.name} - Classes`} />
            <SubjectSummary
              {...summary}
              shouldShowLetterGrade={settings.shouldShowLetterGrade}
            />
            <QueryWrapper
              query={assignments}
              skeleton={<SubjectAssignmentsSkeleton />}
            >
              {(assignments) => (
                <SubjectAssignments
                  {...assignments}
                  term={term ?? undefined}
                  categories={summary.academics.categories}
                  categoryId={category}
                />
              )}
            </QueryWrapper>
          </>
        )}
      </QueryWrapper>
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
