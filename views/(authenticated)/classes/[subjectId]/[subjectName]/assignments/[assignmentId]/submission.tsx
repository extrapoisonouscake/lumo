import { Button } from "@/components/ui/button";
import { FileTypeIcon, FileUpload } from "@/components/ui/file-upload";
import { Link } from "@/components/ui/link";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { VISIBLE_DATE_FORMAT, VISIBLE_TIME_FORMAT } from "@/constants/website";
import { timezonedDayJS } from "@/instances/dayjs";
import { AssignmentSubmissionState } from "@/types/school";
import { getTRPCQueryOptions, queryClient, trpc } from "@/views/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  AttachmentStrokeRounded,
  Delete02StrokeRounded,
  Download01StrokeRounded,
  Upload01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { AssignmentSectionCard } from "./page";
function getSubmissionDownloadLink(id: string) {
  return `/api/aspen/assignmentDownload.do?submissionOid=${id}`;
}
export function SubmissionSection({ assignmentId }: { assignmentId: string }) {
  const query = useQuery(
    getTRPCQueryOptions(trpc.myed.subjects.getAssignmentSubmissionState)({
      assignmentId,
    })
  );

  return (
    <QueryWrapper query={query} showStaleData>
      {(data) => {
        if (!data.isAllowed) return null;
        return (
          <AssignmentSectionCard
            title="Submission"
            icon={AttachmentStrokeRounded}
            contentClassName="gap-4 flex-col sm:flex-row justify-between items-start sm:items-center"
            headerClassName="pb-3"
          >
            {data.file ? (
              <>
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="text-muted-foreground text-sm truncate flex items-center gap-1">
                    <p>
                      Name:{" "}
                      <span className="text-primary font-medium">
                        {data.file.name}
                      </span>
                    </p>
                    <FileTypeIcon
                      className="inline-block"
                      fileName={data.file.name}
                    />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Submitted at{" "}
                    <span className="text-primary font-medium">
                      {timezonedDayJS(data.file.submittedAt).format(
                        `${VISIBLE_DATE_FORMAT}, ${VISIBLE_TIME_FORMAT}`
                      )}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link
                    to={getSubmissionDownloadLink(data.file?.id)}
                    target="_blank"
                    className="flex-1 sm:flex-none"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      leftIcon={
                        <HugeiconsIcon icon={Download01StrokeRounded} />
                      }
                    >
                      Download
                    </Button>
                  </Link>
                  {data.isOpen && (
                    <DeleteSubmissionButton assignmentId={assignmentId} />
                  )}
                </div>
              </>
            ) : (
              <UploadSubmission
                assignmentId={assignmentId}
                isRefetching={query.isFetching}
              />
            )}
          </AssignmentSectionCard>
        );
      }}
    </QueryWrapper>
  );
}
function DeleteSubmissionButton({ assignmentId }: { assignmentId: string }) {
  const mutation = useMutation({
    ...trpc.myed.subjects.deleteAssignmentSubmission.mutationOptions(),
    onSuccess: () => {
      queryClient.setQueryData<AssignmentSubmissionState>(
        trpc.myed.subjects.getAssignmentSubmissionState.queryKey({
          assignmentId,
        }),
        (prev) => ({
          ...prev!,
          file: undefined,
        })
      );
    },
  });
  return (
    <Button
      size="icon"
      className="bg-destructive/10 rounded-xl text-destructive hover:bg-destructive/15"
      onClick={() => mutation.mutateAsync({ assignmentId })}
    >
      <HugeiconsIcon icon={Delete02StrokeRounded} />
    </Button>
  );
}
function UploadSubmission({
  assignmentId,
  isRefetching,
}: {
  assignmentId: string;
  isRefetching: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("assignmentId", assignmentId);
      formData.append("file", file!);
      await fetch("/api/files/upload-assignment-file", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries(
        getTRPCQueryOptions(trpc.myed.subjects.getAssignmentSubmissionState)({
          assignmentId,
        })
      );
    },
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      <FileUpload
        onFileSelect={setFile}
        selectedFile={file}
        disableControls={mutation.isPending}
      />
      <Button
        shouldShowChildrenOnLoading
        disabled={!file}
        isLoading={mutation.isPending || isRefetching}
        variant="brand"
        leftIcon={<HugeiconsIcon icon={Upload01StrokeRounded} />}
        onClick={() => mutation.mutateAsync()}
        className="self-start"
      >
        Upload
      </Button>
    </div>
  );
}
