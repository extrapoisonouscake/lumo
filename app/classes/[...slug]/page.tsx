import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TermSearchParams } from "../page";
import AssignmentPageComponent from "./assignments/[assignmentId]/page-component";
import { SubjectPageSkeleton } from "./content";
import { convertPathParameterToSubjectName } from "./helpers";
import SubjectPageComponent from "./page-component";
interface Props {
  params: { slug: [string, string?, string?, string?] };
  searchParams: Pick<TermSearchParams, "term">;
}

export async function generateMetadata({ params }: Props) {
  const subjectName = convertPathParameterToSubjectName(params.slug[0]);
  return { title: subjectName };
}
export default async function Page({ params, searchParams }: Props) {
  const [subjectName, subjectId, section, contentId] = params.slug;
  switch (section) {
    case "assignments":
      return <AssignmentPageComponent assignmentId={contentId as string} />;
    case undefined:
      return (
        <Suspense fallback={<SubjectPageSkeleton />}>
          <SubjectPageComponent
            subjectName={subjectName}
            subjectId={subjectId}
            term={searchParams.term}
          />
        </Suspense>
      );
    default:
      return notFound();
  }
}
