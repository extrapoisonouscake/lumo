"use client";
import { QueryWrapper } from "@/components/ui/query-wrapper";

import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useSearchParams } from "next/navigation";
import { SubjectsPage } from "./content";

export default function Page() {
  const searchParams = useSearchParams();
  const year = searchParams.get("year") ?? undefined;
  const term = searchParams.get("term") ?? undefined;
  const query = useSubjectsData({
    isPreviousYear: year === "previous",
    termId: term,
  });
  return (
    <QueryWrapper query={query} skeleton={<SubjectsPageSkeleton />}>
      {(response) => (
        <SubjectsPage response={response} year={year} term={term} />
      )}
    </QueryWrapper>
  );
}
function SubjectsPageSkeleton() {
  return <SubjectsPage />;
}
