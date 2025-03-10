"use client";

import { TermSelect, TermSelectSkeleton } from "@/components/misc/term-select";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SubjectAssignmentsTable } from "./table";
import { SubjectPageUserSettings } from "./types";

export function SubjectPageContent({
  subjectId,
  subjectName,
  assignments,
  terms,
  currentTermIndex,
  term,
  ...props
}: MyEdEndpointResponse<"subjectAssignments"> &
  SubjectPageUserSettings & {
    subjectName: string;
    term?: string;
  }) {
  const pathname = usePathname();
  useEffect(() => {
    const fragments = pathname.split("/");
    if (!subjectId || fragments.length === 4) return;
    fragments.push(subjectId);
    window.history.replaceState(null, "", fragments.join("/"));
  }, [subjectId]);
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
        subjectId={subjectId}
        subjectName={subjectName}
        {...props}
      />
    </>
  );
}
export function SubjectPageSkeleton() {
  return (
    <>
      <TermSelectSkeleton />
      <SubjectAssignmentsTable isLoading />
    </>
  );
}
