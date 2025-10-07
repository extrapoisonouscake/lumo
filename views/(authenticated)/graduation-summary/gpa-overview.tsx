import { CircularProgress } from "@/components/misc/circular-progress";
import { ContentCard } from "@/components/misc/content-card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { getGradeInfo } from "@/helpers/grades";
import { TranscriptEntry } from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useMemo } from "react";

export function GPAOverview() {
  const transcriptEntries = useQuery(
    getTRPCQueryOptions(trpc.myed.transcript.getTranscriptEntries)()
  );
  return (
    <QueryWrapper query={transcriptEntries} skeleton={<GPAOverviewSkeleton />}>
      {(data) => <Content data={data} />}
    </QueryWrapper>
  );
}
function Content({ data }: { data: TranscriptEntry[] }) {
  const gpaData = useMemo(
    () =>
      {
const maxGrade = Math.max(...data.map(entry=>entry.grade))
return data
        .filter((entry) => entry.finalGrade !== null&&entry.grade>=maxGrade-1)
        .map((entry) => ({
          percentage: entry.finalGrade!,
          credits: entry.creditAmount,
        }))},
    [data]
  );
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-pointer group">
          <p className="text-sm">
            GPA:{" "}
            <span className="font-medium">
              {getPercentageStyleGPA(gpaData)}% ({getUSStyleGPA(gpaData)})
            </span>
          </p>
          <InfoIcon className="size-4 text-muted-foreground group-hover:text-foreground clickable" />
        </div>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Courses</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <div className="flex flex-col gap-3">
            {data.map((entry, index) => (
              <TranscriptEntryCard key={index} {...entry} />
            ))}
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
const GRADING_SCALE = {
  A: { min: 86, max: 100, gradePointValue: 4 },
  B: { min: 73, max: 85, gradePointValue: 3 },
  "C+": { min: 67, max: 72, gradePointValue: 2.5 },
  C: { min: 60, max: 66, gradePointValue: 2 },
  "C-": { min: 50, max: 59, gradePointValue: 1 },
  F: { min: 0, max: 49, gradePointValue: 0 },
};

// Function to get GPA from percentage grade
function getQualityPoints(percentage: number, credits: number): number {
  for (const [grade, data] of Object.entries(GRADING_SCALE)) {
    if (percentage >= data.min && percentage <= data.max) {
      return data.gradePointValue * credits;
    }
  }
  return 0; // Default to 0 for invalid percentages
}

function getPercentageStyleGPA(
  values: { percentage: number; credits: number }[]
): number {
  if (values.length === 0) return 0;

  // Calculate weighted average using credits as weights
  const totalWeightedPercentage = values.reduce(
    (acc, value) => acc + value.percentage * value.credits,
    0
  );
  const totalCredits = values.reduce((acc, value) => acc + value.credits, 0);

  if (totalCredits === 0) return 0;

  return +(totalWeightedPercentage / totalCredits).toFixed(1);
}
function getUSStyleGPA(
  values: { percentage: number; credits: number }[]
): number {
  const qualityPoints = values.reduce(
    (acc, value) => acc + getQualityPoints(value.percentage, value.credits),
    0
  );
  const credits = values.reduce((acc, value) => acc + value.credits, 0);
  return +(qualityPoints / credits).toFixed(2);
}

function TranscriptEntryCard(entry: TranscriptEntry) {
  return (
    <ContentCard
      header={
        <div className="flex items-center gap-2 justify-between">
          <h3 className="font-medium text-base text-foreground">
            {entry.subjectName}
          </h3>
          <div className="flex items-center gap-1.5">
            {entry.finalGrade !== null ? (
              <>
                <p className="font-medium whitespace-nowrap">
                  {entry.finalGrade} / 100
                </p>
                <CircularProgress
                  values={[
                    {
                      value: entry.finalGrade,
                      fillColor: getGradeInfo(entry.finalGrade)!.color,
                    },
                  ]}
                  size="small"
                />
              </>
            ) : (
              <span className="text-muted-foreground">
                {NULL_VALUE_DISPLAY_FALLBACK}
              </span>
            )}
          </div>
        </div>
      }
      items={[
        {
          label: "Grade",
          value: entry.grade,
        },
        { label: "Credits", value: entry.creditAmount },
      ]}
    />
  );
}
function GPAOverviewSkeleton() {
  return <Skeleton className="text-sm">GPA: 4.0</Skeleton>;
}
