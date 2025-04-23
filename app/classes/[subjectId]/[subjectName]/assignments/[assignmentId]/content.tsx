"use client";
import { TitleManager } from "@/components/misc/title-manager";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { useSubjectAssignment } from "@/hooks/trpc/use-subject-assignment";
import { useParams } from "next/navigation";
export function AssignmentPageContent() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const assignmentId = params.assignmentId as string;
  const assignment = useSubjectAssignment(subjectId, assignmentId);
  return (
    <QueryWrapper query={assignment}>
      {(data) => {
        return (
          <>
            <TitleManager title={data.name} />
            <div>
              <h2 className="text-xl font-semibold">{data.name}</h2>
            </div>
          </>
        );
      }}
    </QueryWrapper>
  );
}
