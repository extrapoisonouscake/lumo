import { getUserSettings } from "@/lib/settings/queries";
import { SubjectAssignmentsSkeleton } from "./(assignments)/content";
import { SubjectSummarySkeleton } from "./summary";

export default function Loading() {
  const settings = getUserSettings();
  return (
    <>
      <SubjectSummarySkeleton
        shouldShowLetterGrade={settings.shouldShowLetterGrade}
      />
      <SubjectAssignmentsSkeleton />
    </>
  );
}
