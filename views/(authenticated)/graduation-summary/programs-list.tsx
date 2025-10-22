import { CircularProgress } from "@/components/misc/circular-progress";
import { ErrorCard } from "@/components/misc/error-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { cn } from "@/helpers/cn";
import { ProgramEntry, ProgramRequirementEntry } from "@/types/school";

import {
  CheckListStrokeRounded,
  CheckmarkCircle02StrokeRounded,
  MinusSignCircleStrokeRounded,
  ScrollStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { GPAOverview } from "./gpa-overview";

export function GraduationSummaryProgramsList({
  programs,
  programRequirementEntries,
}: {
  programs: ProgramEntry[];
  programRequirementEntries: ProgramRequirementEntry[];
}) {
  const [currentProgramIndex, setCurrentProgramIndex] = useState<number | null>(
    null
  );

  let content;
  const sortedData = useMemo(
    () =>
      programs.sort((a) => {
        //completed or excluded programs always at the bottom
        return a.completedUnits >= a.requiredUnits || !a.isIncluded ? 1 : 0;
      }),
    [programs]
  );
  if (programs.length === 0) {
    content = <ErrorCard emoji="🎓" message="No programs found" />;
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {sortedData.map((program, index) => (
            <ProgramCard
              key={`${program.code}-${index}`}
              program={program}
              onViewRequirements={() => setCurrentProgramIndex(index)}
            />
          ))}
        </div>
        <TotalProgressCard programs={sortedData} />
      </div>
    );
  }

  const currentProgram = useMemo(
    () =>
      currentProgramIndex !== null
        ? sortedData[currentProgramIndex]!
        : undefined,
    [currentProgramIndex, sortedData]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={ScrollStrokeRounded}
            className="h-5 w-5 text-brand print:text-muted-foreground"
          />
          <h2 className="text-lg font-semibold">Programs</h2>
        </div>
        <GPAOverview programRequirementEntries={programRequirementEntries} />
      </div>
      {content}
      <RequirementDialog
        currentProgram={currentProgram}
        onOpenChange={(open) => {
          if (!open) {
            setCurrentProgramIndex(null);
          }
        }}
      />
    </div>
  );
}
function TotalProgressCard({ programs }: { programs: ProgramEntry[] }) {
  const includedPrograms = useMemo(
    () => programs.filter((program) => program.isIncluded),
    [programs]
  );
  const totalCompletedUnits = useMemo(
    () =>
      includedPrograms.reduce(
        (acc, program) =>
          acc + Math.min(program.completedUnits, program.requiredUnits),
        0
      ),
    [includedPrograms]
  );
  const totalRequiredUnits = useMemo(
    () =>
      includedPrograms.reduce((acc, program) => acc + program.requiredUnits, 0),
    [includedPrograms]
  );
  const totalPendingUnits = useMemo(
    () =>
      includedPrograms.reduce(
        (acc, program) => acc + (program.limitedPendingUnits ?? 0),
        0
      ),
    [includedPrograms]
  );
  const percentages = {
    completed: (totalCompletedUnits / totalRequiredUnits) * 100,
    pending: (totalPendingUnits / totalRequiredUnits) * 100,
  };
  return (
    <Card className="px-4 py-3 flex-row flex-wrap justify-between gap-2">
      <p className="text-sm text-muted-foreground">Total</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium">
          {(totalCompletedUnits + totalPendingUnits).toFixed(1)} /{" "}
          {totalRequiredUnits.toFixed(1)} units{" "}
          <span className="text-muted-foreground">
            ({(percentages.completed + percentages.pending).toFixed(1)}
            %)
          </span>
        </p>
        {percentages.completed >= 100 ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02StrokeRounded}
            strokeWidth={2.3}
            className="size-4 text-green-600"
          />
        ) : (
          <CircularProgress
            values={[
              {
                value: percentages.completed,
                className: "text-green-500",
              },
              {
                value: percentages.pending,
                className: "text-yellow-400",
              },
            ]}
            size="small"
            className="no-print"
          />
        )}
      </div>
    </Card>
  );
}
function ProgramCard({
  program,
  onViewRequirements,
}: {
  program: ProgramEntry;
  onViewRequirements: () => void;
}) {
  let percentages: { completed: number; pending?: number } | undefined;
  if (program.requiredUnits > 0) {
    percentages = {
      completed: Math.min(
        (program.completedUnits / program.requiredUnits) * 100,
        100
      ),
      pending: program.pendingUnits
        ? ((program.limitedPendingUnits ?? 0) / program.requiredUnits) * 100
        : undefined,
    };
  }

  const displayName = program.name || program.code;
  const isExcluded = !program.isIncluded;

  return (
    <Card className="p-4 justify-between pb-0 print:pb-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate" title={displayName}>
              {displayName}
            </h3>
            {isExcluded && (
              <Badge variant="outline" className="text-muted-foreground pl-1">
                <HugeiconsIcon
                  icon={MinusSignCircleStrokeRounded}
                  className="h-3 w-3"
                />
                Excluded
              </Badge>
            )}
          </div>

          {program.creditsWaived !== undefined && program.creditsWaived > 0 && (
            <p className="text-sm text-muted-foreground">
              {program.creditsWaived} credits waived
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium text-primary">
              {(
                program.completedUnits + (program.limitedPendingUnits ?? 0)
              ).toFixed(1)}{" "}
              / {program.requiredUnits.toFixed(1)} units{" "}
              {!!program.limitedPendingUnits && (
                <>
                  <span className="text-muted-foreground font-normal text-xs">
                    ({program.limitedPendingUnits.toFixed(1)} in progress)
                  </span>
                </>
              )}
            </span>
          </div>

          <Progress
            segments={
              percentages
                ? [
                    { value: percentages.completed, color: "bg-green-500" },
                    {
                      value: percentages.pending ?? 0,
                      color: "bg-yellow-400",
                    },
                  ]
                : []
            }
            className="h-2"
            indicatorClassName={cn(
              "preserve-color",
              isExcluded && "bg-muted-foreground/30"
            )}
          />

          {percentages && (
            <div className="flex justify-end text-xs">
              <span className={cn("font-medium", "text-muted-foreground")}>
                {(percentages.completed + (percentages.pending ?? 0)).toFixed(
                  1
                )}
                %
              </span>
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewRequirements}
        disabled={!program.requirements || program.requirements.length === 0}
        className="w-full text-xs h-fit text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed pt-2 pb-4 no-print"
      >
        {program.requirements && program.requirements.length > 0 ? (
          <>
            <HugeiconsIcon icon={CheckListStrokeRounded} className="size-3" />
            View Requirements
          </>
        ) : (
          <>
            <HugeiconsIcon
              icon={MinusSignCircleStrokeRounded}
              className="size-3"
            />
            No Requirements
          </>
        )}
      </Button>
    </Card>
  );
}

function RequirementCard({
  requirement,
}: {
  requirement: NonNullable<ProgramEntry["requirements"]>[0];
}) {
  let percentages: { completed: number; pending?: number } | undefined;
  if (requirement.requiredUnits > 0) {
    percentages = {
      completed: (requirement.completedUnits / requirement.requiredUnits) * 100,
      pending: requirement.pendingUnits
        ? (requirement.pendingUnits / requirement.requiredUnits) * 100
        : undefined,
    };
  }

  const displayName = requirement.name || requirement.code;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {requirement.creditsWaived > 0 && (
            <Badge variant="outline" className="text-xs">
              {requirement.creditsWaived} waived
            </Badge>
          )}
          <div>
            <h4 className="font-medium text-sm">{displayName}</h4>
            <p className="text-xs text-muted-foreground">
              {requirement.completedUnits.toFixed(1)} /{" "}
              {requirement.requiredUnits.toFixed(1)} units
              {!!requirement.pendingUnits && (
                <>
                  {" "}
                  <span className="text-xs text-yellow-500">
                    ({requirement.pendingUnits.toFixed(1)} in progress)
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {percentages && (
          <CircularProgress
            values={[
              { value: percentages.completed, className: "text-green-500" },
              { value: percentages.pending ?? 0, className: "text-yellow-400" },
            ]}
            size="normal"
          />
        )}
      </div>
    </Card>
  );
}
function RequirementDialog({
  currentProgram,
  onOpenChange,
}: {
  currentProgram?: ProgramEntry;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveDialog open={!!currentProgram} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {currentProgram?.name || currentProgram?.code} - Requirements
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="gap-4">
          {currentProgram?.requirements &&
          currentProgram.requirements.length > 0 ? (
            currentProgram.requirements.map((requirement, index) => (
              <RequirementCard key={index} requirement={requirement} />
            ))
          ) : (
            <ErrorCard
              emoji="🤔"
              message="No requirements available for this program."
            />
          )}
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
