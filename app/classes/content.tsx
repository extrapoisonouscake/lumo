"use client";
import {
  TermSelects,
  TermSelectsSkeleton,
} from "@/app/classes/[subjectId]/term-selects";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";
import { SubjectsTable } from "./table";

import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useSubjectSummaries } from "@/hooks/trpc/use-subjects-summaries";
import { useSearchParams } from "next/navigation";

export function SubjectsPageContent() {
  const searchParams = useSearchParams();
  const year = searchParams.get("year") ?? undefined;
  const term = searchParams.get("term") ?? undefined;
  const query = useSubjectsData({
    isPreviousYear: year === "previous",
    termId: term,
  });
  const subjectSummaries = useSubjectSummaries({
    ids: query.data?.subjects.main.map((subject) => subject.id),
  });
  return (
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
            year={year}
            term={term}
          />
        );
      }}
    </QueryWrapper>
  );
}
function SubjectsPageSkeleton() {
  return <LoadedContent />;
}

function LoadedContent({
  response,
  year,
  term,
}: {
  response?: MyEdEndpointResponse<"subjects">;
  year?: string;
  term?: string;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {response ? (
          <TermSelects
            terms={response.terms}
            initialYear={year}
            initialTerm={term}
          />
        ) : (
          <TermSelectsSkeleton />
        )}
      </div>
      <SubjectsTable data={response?.subjects.main} isLoading={!response} />

      {response?.subjects.teacherAdvisory && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Teacher Advisory</h3>
          <SubjectsTable
            shownColumns={["room", "teachers"]}
            data={[response.subjects.teacherAdvisory]}
          />
        </div>
      )}
    </>
  );
}
