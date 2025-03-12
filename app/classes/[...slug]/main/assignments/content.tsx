"use client";

import { TermSelect, TermSelectSkeleton } from "@/components/misc/term-select";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";

import { UserSettings } from "@/types/core";
import {
  SubjectAssignmentsTable,
  SubjectAssignmentsTableSkeleton,
} from "./table";

export function SubjectAssignmentsContent({
  subjectId,
  assignments,
  terms,
  currentTermIndex,
  term,
  settings,
}: MyEdEndpointResponse<"subjectAssignments"> & {
  settings: UserSettings;
  term: string | undefined;
  subjectId: string;
}) {
  return (
    <>
      <TermSelect
        terms={terms}
        initialTerm={
          term || (currentTermIndex ? terms[currentTermIndex].id : undefined)
        }
        shouldShowAllOption={false}
        shouldShowYearSelect={false}
      />
      <SubjectAssignmentsTable
        data={assignments}
        settings={settings}
        subjectId={subjectId}
      />
    </>
  );
}
export function SubjectAssignmentsSkeleton() {
  return (
    <>
      <TermSelectSkeleton />
      <SubjectAssignmentsTableSkeleton />
    </>
  );
}
