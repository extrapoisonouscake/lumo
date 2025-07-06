"use client";

import { TermSelects } from "@/app/classes/[subjectId]/term-selects";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";

import { SubjectSummary } from "@/types/school";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CategorySelect, CategorySelectSkeleton } from "./category-select";
import { ResponsiveAssignmentsSkeleton } from "./responsive-assignments";

// Use dynamic import for the ResponsiveAssignments component
const ResponsiveAssignments = dynamic(
  () =>
    import("./responsive-assignments").then((mod) => mod.ResponsiveAssignments),
  {
    ssr: false,
    loading: () => <ResponsiveAssignmentsSkeleton />,
  }
);

export function SubjectAssignments({
  assignments,
  terms,
  currentTermIndex,
  categoryId: initialCategoryId,
  term,
  categories,
}: MyEdEndpointResponse<"subjectAssignments"> & {
  term: string | undefined;
  categoryId: string | "all";
  categories: SubjectSummary["academics"]["categories"];
}) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {terms && (
          <TermSelects
            terms={terms}
            initialTerm={
              term ||
              (currentTermIndex ? terms[currentTermIndex]!.id : undefined)
            }
            shouldShowAllOption={false}
            shouldShowYearSelect={false}
          />
        )}
        <CategorySelect
          value={categoryId}
          onChange={setCategoryId}
          categories={categories}
        />
      </div>

      <ResponsiveAssignments categoryId={categoryId} data={assignments} />
    </div>
  );
}

export function SubjectAssignmentsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <CategorySelectSkeleton />
      </div>
      <ResponsiveAssignmentsSkeleton />
    </div>
  );
}
