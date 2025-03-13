import { SubjectAssignmentsSkeleton } from "./(assignments)/content";
import { SubjectSummarySkeleton } from "./summary";

export default function Loading() {
  return (
    <>
      <SubjectSummarySkeleton />
      <SubjectAssignmentsSkeleton />
    </>
  );
}
