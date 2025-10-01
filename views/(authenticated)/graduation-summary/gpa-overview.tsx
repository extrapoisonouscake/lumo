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
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { TranscriptEntry } from "@/types/school";
import { trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import { useMemo } from "react";

export function GPAOverview() {
  const transcriptEntries = useQuery(
    trpc.myed.transcript.getTranscriptEntries.queryOptions()
  );
  return (
    <QueryWrapper query={transcriptEntries}>
      {(data) => <Content data={data} />}
    </QueryWrapper>
  );
}
function Content({ data }: { data: TranscriptEntry[] }) {
  const gpa = useMemo(
    () =>
      getGPA(
        data
          .filter((entry) => entry.finalGrade !== null)
          .map((entry) => ({
            percentage: entry.finalGrade!,
            credits: entry.creditAmount,
          }))
      ),
    [data]
  );
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-sm">
        GPA: <span className="font-medium">{gpa}</span>
      </p>
      <ResponsiveDialog>
        <ResponsiveDialogTrigger asChild>
          <InfoIcon className="size-4 text-muted-foreground cursor-pointer hover:text-foreground clickable" />
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
    </div>
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

function getGPA(values: { percentage: number; credits: number }[]): number {
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
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-base text-foreground">
            {entry.subjectName}
          </h3>
          <p className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
            Grade {entry.grade}
          </p>
        </div>
      }
      items={[
        { label: "Year", value: entry.year },
        { label: "Credits", value: entry.creditAmount },
        {
          label: "Final",
          value:
            entry.finalGrade !== null ? (
              entry.finalGrade
            ) : (
              <span className="text-muted-foreground">
                {NULL_VALUE_DISPLAY_FALLBACK}
              </span>
            ),
          valueClassName: "text-lg",
        },
      ]}
    />
  );
}
