"use client";

import { TermSelect, TermSelectSkeleton } from "@/components/misc/term-select";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";

import { UserSettings } from "@/types/core";
import dynamic from "next/dynamic";
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

export function SubjectAssignmentsContent({
  assignments,
  terms,
  currentTermIndex,
  term,
  settings,
}: MyEdEndpointResponse<"subjectAssignments"> & {
  settings: UserSettings;
  term: string | undefined;
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

      <ResponsiveAssignments data={assignments} settings={settings} />
    </>
  );
}

export function SubjectAssignmentsSkeleton() {
  return (
    <>
      <TermSelectSkeleton shouldShowYearSelect={false} />
      <ResponsiveAssignmentsSkeleton />
    </>
  );
}
