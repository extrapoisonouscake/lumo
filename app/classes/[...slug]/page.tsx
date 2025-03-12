import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TermSearchParams } from "../page";
import AssignmentPageComponent from "./assignments/[assignmentId]/page-component";
import { convertPathParameterToSubjectName } from "./helpers";
import SubjectPageComponent, { SubjectPageSkeleton } from "./main";

interface Props {
  params: { slug: [string, string?, string?, string?] };
  searchParams: Pick<TermSearchParams, "term">;
}

export async function generateMetadata({ params }: Props) {
  const subjectName = convertPathParameterToSubjectName(params.slug[0]);
  return { title: subjectName };
}
export default async function Page({ params, searchParams }: Props) {
  const [subjectNameOrId, section, contentId] = params.slug;
  const isQueryParamName = subjectNameOrId.startsWith("n_");
  switch (section) {
    case "assignments":
      return <AssignmentPageComponent assignmentId={contentId as string} />;
    case undefined:
      return (
        <Suspense fallback={<SubjectPageSkeleton />}>
          <SubjectPageComponent
            subjectName={
              isQueryParamName
                ? decodeURIComponent(subjectNameOrId.slice(2))
                : subjectNameOrId
            }
            subjectId={isQueryParamName ? undefined : subjectNameOrId}
            termId={searchParams.term}
          />
        </Suspense>
      );
    default:
      return notFound();
  }
}
