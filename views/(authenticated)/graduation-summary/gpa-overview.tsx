import { CircularProgress } from "@/components/misc/circular-progress";
import { ContentCard } from "@/components/misc/content-card";
import { Spinner } from "@/components/ui/button";
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
import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { getGradeInfo } from "@/helpers/grades";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useSubjectSummaries } from "@/hooks/trpc/use-subjects-summaries";
import {
  PersonalDetails,
  ProgramRequirementEntry,
  TranscriptEntry,
} from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import {
  Clock05StrokeRounded,
  InformationCircleStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
type InferredTranscriptEntry = Omit<TranscriptEntry, "year"> & {
  isCompleted: boolean;
};
export function GPAOverview({
  programRequirementEntries,
}: {
  programRequirementEntries: ProgramRequirementEntry[];
}) {
  const transcriptEntries = useQuery(
    getTRPCQueryOptions(trpc.myed.transcript.getTranscriptEntries)()
  );
  const currentSubjects = useSubjectsData({
    isPreviousYear: false,
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });
  const subjectNameToCreditAmount = useMemo(() => {
    return programRequirementEntries.reduce(
      (acc, entry) => {
        acc[entry.name] = entry.completedUnits;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [programRequirementEntries]);
  const pendingAveragesQuery = useSubjectSummaries(
    {
      ids: currentSubjects.data?.subjects.main.map((subject) => subject.id),
      year: "current",
    },
    (summary) =>
      ({
        finalGrade:
          (
            summary.academics.posted.overall ??
            summary.academics.running.overall
          )?.mark ?? null,
        subjectName: summary.name.prettified,
        creditAmount:
          subjectNameToCreditAmount[summary.name.prettified] ?? null,
        isCompleted: summary.academics.posted.overall !== null,
      }) satisfies Omit<InferredTranscriptEntry, "grade">
  );
  const student = useStudentDetails();
  //GPA matters only for grade 11 and above
  if (student.isSuccess && student.data.grade < 11) return null;
  return (
    <QueryWrapper query={transcriptEntries} skeleton={<GPAOverviewSkeleton />}>
      {(data) => (
        <QueryWrapper query={student} skeleton={<GPAOverviewSkeleton />}>
          {(studentData) => (
            <QueryWrapper
              query={pendingAveragesQuery}
              skeleton={<GPAOverviewSkeleton />}
            >
              {(pendingAverages) => (
                <Content
                  completedEntries={data.map((entry) => ({
                    ...entry,
                    isCompleted: true,
                  }))}
                  pendingEntries={Object.values(pendingAverages).map(
                    (entry) => ({ ...entry, grade: studentData.grade })
                  )}
                  currentGrade={studentData.grade}
                />
              )}
            </QueryWrapper>
          )}
        </QueryWrapper>
      )}
    </QueryWrapper>
  );
}
function Content({
  completedEntries,
  currentGrade,
  pendingEntries,
}: {
  completedEntries: InferredTranscriptEntry[];
  currentGrade: PersonalDetails["grade"];
  pendingEntries: InferredTranscriptEntry[];
}) {
  const data = useMemo(() => {
    const allEntries = [...pendingEntries, ...completedEntries].filter(
      //only showing the last 2 years
      (entry) =>
        entry.finalGrade !== null &&
        entry.creditAmount !== null &&
        entry.grade >= 11
    );

    const seenNames = new Set();

    return allEntries.filter((entry) => {
      if (seenNames.has(entry.subjectName)) {
        return false;
      }
      seenNames.add(entry.subjectName);
      return true;
    });
  }, [pendingEntries, completedEntries, currentGrade]);
  const gpaData = useMemo(() => {
    return data.map((entry) => ({
      percentage: entry.finalGrade!,
      credits: entry.creditAmount,
    }));
  }, [completedEntries, pendingEntries]);
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-pointer group clickable">
          <p className="text-sm">
            GPA:{" "}
            <span className="font-medium">
              {getPercentageStyleGPA(gpaData)}% (
              {getUSStyleGPA(gpaData).toFixed(2)})
            </span>
          </p>
          <HugeiconsIcon
            icon={InformationCircleStrokeRounded}
            className="no-print size-4 text-muted-foreground group-hover:text-foreground transition-colors"
          />
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
  values: { percentage: number; credits: number | null }[]
): number {
  const validValues = values.filter((value) => value.credits !== null);
  if (validValues.length === 0) return 0;

  // Calculate weighted average using credits as weights
  const totalWeightedPercentage = validValues.reduce(
    (acc, value) => acc + value.percentage * value.credits!,
    0
  );
  const totalCredits = validValues.reduce(
    (acc, value) => acc + value.credits!,
    0
  );

  if (totalCredits === 0) return 0;

  return +(totalWeightedPercentage / totalCredits).toFixed(1);
}
function getUSStyleGPA(
  values: { percentage: number; credits: number | null }[]
): number {
  const validValues = values.filter((value) => value.credits !== null);
  const qualityPoints = validValues.reduce(
    (acc, value) => acc + getQualityPoints(value.percentage, value.credits!),
    0
  );
  const credits = validValues.reduce((acc, value) => acc + value.credits!, 0);
  return +(qualityPoints / credits).toFixed(2);
}

function TranscriptEntryCard(entry: InferredTranscriptEntry) {
  return (
    <ContentCard
      header={
        <div className="flex gap-8 justify-between">
          <div>
            <h3 className="inline-block font-medium text-base text-foreground leading-tight">
              {entry.subjectName}
              {!entry.isCompleted && (
                <span className="ml-1.5 inline-block align-[-0.13rem]">
                  <HugeiconsIcon
                    icon={Clock05StrokeRounded}
                    className="size-4 min-w-4 text-yellow-500"
                  />
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 h-fit">
            {entry.finalGrade !== null ? (
              <>
                <p className="font-medium whitespace-nowrap">
                  {entry.finalGrade} / 100
                </p>
                <CircularProgress
                  values={[
                    {
                      value: entry.finalGrade,
                      className: getGradeInfo(entry.finalGrade)!
                        .secondaryTextClassName,
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
  return (
    <div className="flex items-center gap-1.5 no-print">
      <p>GPA:</p>
      <Spinner className="size-4 text-brand" />
      <Skeleton className="text-sm">99% (4.0)</Skeleton>
    </div>
  );
}
