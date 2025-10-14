"use client";
import { TitleManager } from "@/components/misc/title-manager";

import { QueryWrapper } from "@/components/ui/query-wrapper";
import { useSubjectAssignments } from "@/hooks/trpc/use-subject-assignments";
import { useSubjectSummary } from "@/hooks/trpc/use-subject-summary";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { SubjectYear } from "@/types/school";

import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQueries } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import {
  SubjectAssignmentsTable,
  SubjectAssignmentsTableSkeleton,
} from "./(assignments)/table";
import { SubjectSummary, SubjectSummarySkeleton } from "./summary";

export default function SubjectPage() {
  const [searchParams] = useSearchParams();
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
  const assignmentsSubmissionStatuses = useQueries({
    queries:
      assignments.data?.assignments.map((assignment) =>
        getTRPCQueryOptions(trpc.myed.subjects.getAssignmentSubmissionState)({
          assignmentId: assignment.id,
        })
      ) ?? [],
    combine: (results) => {
      return results.map((result) => result.data);
    },
  });
  return (
    <div className="flex flex-col gap-3">
      <QueryWrapper query={summary} skeleton={<SubjectPageSkeleton />}>
        {(summary) => (
          <>
            <TitleManager>{summary.name.prettified} - Classes</TitleManager>
            <div className="flex flex-col gap-4">
              <SubjectSummary
                {...summary}
                shouldShowLetterGrade={settings.shouldShowLetterGrade}
              />
              <QueryWrapper
                query={assignments}
                skeleton={<SubjectAssignmentsTableSkeleton />}
              >
                {(data) => (
                  <SubjectAssignmentsTable
                    {...data}
                    assignments={data.assignments.map((assignment, index) => ({
                      ...assignment,
                      hasSubmission:
                        !!assignmentsSubmissionStatuses[index]?.file,
                    }))}
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
      <SubjectAssignmentsTableSkeleton />
    </div>
  );
}
