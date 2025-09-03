"use client";
import {
  TermSelects,
  TermSelectsSkeleton,
} from "@/app/(authenticated)/classes/[subjectId]/term-selects";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";
import { SubjectsTable } from "./table";

import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useSubjectSummaries } from "@/hooks/trpc/use-subjects-summaries";
import { SubjectYear } from "@/types/school";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function SubjectsPageContent() {
  const searchParams = useSearchParams();
  const year = (searchParams.get("year") ?? "current") as SubjectYear;
  const term = searchParams.get("term") ?? undefined;
  const isPreviousYear = year === "previous";
  const query = useSubjectsData({
    isPreviousYear,
    termId: isPreviousYear && !term ? MYED_ALL_GRADE_TERMS_SELECTOR : term,
  });
  const subjectSummaries = useSubjectSummaries({
    ids: query.data?.subjects.main.map((subject) => subject.id),
    year: isPreviousYear ? "previous" : "current",
  });
  const currentTermIndex = useMemo(
    () =>
      Object.values(subjectSummaries.data)[0]?.currentTermIndex ?? undefined,
    [subjectSummaries.data]
  );

  return (
    <div className="flex flex-col gap-2">
      <QueryWrapper query={query} skeleton={<SubjectsPageSkeleton />}>
        {(response) => {
          return (
            <LoadedContent
              response={{
                ...response,
                subjects: {
                  ...response.subjects,
                  main: response.subjects.main.map((subject) => {
                    const academics =
                      subjectSummaries.data[subject.id]?.academics;
                    return {
                      ...subject,
                      average:
                        academics?.posted.overall ?? academics?.running.overall,
                    };
                  }),
                },
              }}
              //*timewise
              currentTermIndex={currentTermIndex}
              year={year}
              term={term}
            />
          );
        }}
      </QueryWrapper>
    </div>
  );
}
function SubjectsPageSkeleton() {
  return <LoadedContent year="current" />;
}

function LoadedContent({
  response,
  year,
  term,
  currentTermIndex,
}: {
  response?: MyEdEndpointResponse<"subjects">;
  year: SubjectYear;
  term?: string;
  currentTermIndex?: number;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {response ? (
          <TermSelects
            terms={response.terms}
            initialYear={year}
            initialTerm={
              term ??
              (typeof currentTermIndex === "number"
                ? response.terms[currentTermIndex]!.id
                : //when the term is not set and year is previous, automatically select all terms
                "isDerivedAllTerms" in response || year === "previous"
                ? MYED_ALL_GRADE_TERMS_SELECTOR
                : undefined)
            }
          />
        ) : (
          <TermSelectsSkeleton />
        )}
      </div>
      <SubjectsTable
        data={response?.subjects.main}
        isLoading={!response}
        year={year}
      />

      {response?.subjects.teacherAdvisory && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Teacher Advisory</h3>
          <SubjectsTable
            year={year}
            isLoading={false}
            shownColumns={["room", "teachers"]}
            data={[response.subjects.teacherAdvisory]}
          />
        </div>
      )}
    </>
  );
}
