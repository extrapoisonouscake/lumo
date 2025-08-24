"use client";
import { TitleManager } from "@/components/misc/title-manager";

import { useParams, useSearchParams } from "next/navigation";

import { QueryWrapper } from "@/components/ui/query-wrapper";
import { useSubjectAssignments } from "@/hooks/trpc/use-subject-assignments";
import { useSubjectSummary } from "@/hooks/trpc/use-subject-summary";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { SubjectYear } from "@/types/school";
import {
  SubjectAssignments,
  SubjectAssignmentsSkeleton,
} from "./(assignments)";
import { SubjectSummary, SubjectSummarySkeleton } from "./summary";

export default function SubjectPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const termId = searchParams.get("term") ?? undefined;
  const year = searchParams.get("year") ?? "current";
  const category = searchParams.get("category") ?? "all";
  const settings = useUserSettings();
  const summary = useSubjectSummary(subjectId, year as SubjectYear);

  const assignments = useSubjectAssignments({
    id: subjectId,
    term: summary.data?.term,
    termId,
  });
  return (
    <div className="flex flex-col gap-3">
      <QueryWrapper query={summary} skeleton={<SubjectPageSkeleton />}>
        {(summary) => (
          <>
            <TitleManager title={`${summary.name} - Classes`} />
            <div className="flex flex-col gap-4">
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
                    term={termId ?? undefined}
                    categories={summary.academics.categories}
                    categoryId={category}
                  />
                )}
              </QueryWrapper>
            </div>
          </>
        )}
      </QueryWrapper>
    </div>
  );
}
export function SubjectPageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SubjectSummarySkeleton />
      <SubjectAssignmentsSkeleton />
    </div>
  );
}
