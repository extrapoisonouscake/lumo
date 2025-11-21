import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Link } from "@/components/ui/link";
import { Progress } from "@/components/ui/progress";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import {
  CF_WORKER_URL,
  VISIBLE_DATE_FORMAT,
  VISIBLE_TIME_FORMAT,
} from "@/constants/website";
import { timezonedDayJS } from "@/instances/dayjs";
import { AssignmentSubmissionState } from "@/types/school";
import {
  ensureValidSession,
  getTRPCQueryOptions,
  queryClient,
  trpc,
} from "@/views/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  AttachmentStrokeRounded,
  Delete02StrokeRounded,
  Download01StrokeRounded,
  Upload01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { processSubmissionFiles } from "./helpers";
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
    <QueryWrapper query={query}>
      {(data) => {
        if (!data.isAllowed) return null;
        return (
          <AssignmentSectionCard
            title="Submission"
            icon={AttachmentStrokeRounded}
            contentClassName="gap-3 flex-col sm:flex-row justify-between items-start sm:items-end"
            headerClassName="pb-2"
          >
            {data.file ? (
              <>
                <div className="flex flex-col gap-2 min-w-0">
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
                    <DeleteSubmissionButton
                      submissionId={data.file.id}
                      assignmentId={assignmentId}
                    />
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
function DeleteSubmissionButton({
  submissionId,
  assignmentId,
}: {
  submissionId: string;
  assignmentId: string;
}) {
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
      onClick={() => mutation.mutateAsync({ submissionId, assignmentId })}
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
  const [files, setFiles] = useState<File[]>([]);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) {
        throw new Error("No files selected");
      }

      // Reset progress
      setProcessingProgress(0);
      setUploadProgress(0);
      setIsProcessing(true);

      // Process files: merge images to PDF or create ZIP archive (only if multiple files)
      let fileToUpload: File;
      if (files.length > 1) {
        // Track processing progress (0-50% of total progress)
        fileToUpload = await processSubmissionFiles(files, (progress) => {
          if (
            progress.type === "PROCESSING_FILE" &&
            progress.current &&
            progress.total
          ) {
            // Progress through files: 0-50% for processing files
            const fileProgress = (progress.current / progress.total) * 50;
            setProcessingProgress(fileProgress);
          } else if (progress.type === "GENERATING") {
            // Generating final file: 50%
            setProcessingProgress(50);
          }
        });
      } else {
        // Single file, no processing needed
        fileToUpload = files[0]!;
        setProcessingProgress(50);
      }

      // Processing complete, now uploading
      setIsProcessing(false);

      // Upload file with progress tracking using XMLHttpRequest
      return new Promise<void>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("assignmentId", assignmentId);

        const xhr = new XMLHttpRequest();

        // Track upload progress (50-100% of total progress)
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            // Map upload progress to 50-100% range
            setUploadProgress(50 + (percentComplete / 100) * 50);
          }
        });

        // Handle completion
        xhr.addEventListener("load", async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(
                new Error(errorData.error || `Upload failed: ${xhr.status}`)
              );
            } catch {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed: Network error"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload was cancelled"));
        });

        // Start upload
        ensureValidSession()
          .then(() => {
            xhr.open("POST", CF_WORKER_URL);
            xhr.withCredentials = true;
            xhr.send(formData);
          })
          .catch(reject);
      });
    },
    onSuccess: async () => {
      await queryClient.refetchQueries(
        getTRPCQueryOptions(trpc.myed.subjects.getAssignmentSubmissionState)({
          assignmentId,
        })
      );
      setFiles([]);
      setProcessingProgress(0);
      setUploadProgress(0);
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setProcessingProgress(0);
      setUploadProgress(0);
      setIsProcessing(false);
    },
  });

  const showProgress = mutation.isPending;
  // Calculate combined progress: processing (0-50%) + upload (50-100%)
  const combinedProgress = isProcessing
    ? processingProgress
    : Math.max(processingProgress, uploadProgress);
  const progressLabel = isProcessing ? "Processing files..." : "Uploading...";

  return (
    <div className="flex flex-col gap-4 w-full">
      <FileUpload
        onFileSelect={setFiles}
        selectedFiles={files}
        disableControls={mutation.isPending}
      />

      {showProgress && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progressLabel}</span>
            <span className="font-medium">{Math.round(combinedProgress)}%</span>
          </div>
          <Progress className="h-2" segments={[{ value: combinedProgress }]} />
        </div>
      )}

      <Button
        shouldShowChildrenOnLoading
        disabled={files.length === 0}
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
