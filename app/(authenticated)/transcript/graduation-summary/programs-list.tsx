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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/helpers/cn";
import { ProgramEntry, TranscriptEducationPlan } from "@/types/school";
import { GraduationCap, Info, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

export function GraduationSummaryProgramsList({
  programs,
  educationPlans,
  currentEducationPlanId,
  setCurrentEducationPlanId,
}: {
  programs: ProgramEntry[];
  educationPlans: TranscriptEducationPlan[];
  currentEducationPlanId: string | null;
  setCurrentEducationPlanId: (id: string | null) => void;
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
      <div className="flex justify-between flex-wrap sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold">Programs</h2>
        </div>
        <Select
          value={currentEducationPlanId ?? undefined}
          onValueChange={(value) => setCurrentEducationPlanId(value)}
        >
          <SelectTrigger className="w-fit">
            <SelectValue placeholder="Select an education plan" />
          </SelectTrigger>
          <SelectContent>
            {educationPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        (acc, program) => acc + program.completedUnits,
        0
      ),
    [includedPrograms]
  );
  const totalRequiredUnits = useMemo(
    () =>
      includedPrograms.reduce((acc, program) => acc + program.requiredUnits, 0),
    [includedPrograms]
  );
  return (
    <Card className="px-4 py-3 flex-row flex-wrap justify-between gap-2">
      <p className="text-sm font-medium">Total</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-muted-foreground font-medium">
          {totalCompletedUnits} / {totalRequiredUnits} units
        </p>
        <CircularProgress
          value={(totalCompletedUnits / totalRequiredUnits) * 100}
          fillColor="brand"
          size="small"
        />
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
  const progressPercentage =
    program.requiredUnits > 0
      ? Math.min((program.completedUnits / program.requiredUnits) * 100, 100)
      : 0;

  const displayName = program.name || program.code;
  const isExcluded = !program.isIncluded;

  return (
    <Card className="p-4 gap-3 justify-between pb-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate" title={displayName}>
            {displayName}
          </h3>
          {isExcluded && (
            <Badge
              variant="outline"
              className="text-sm text-muted-foreground font-medium"
            >
              <XCircle className="h-3 w-3 mr-1" />
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
          <span className="font-medium">
            {program.completedUnits.toFixed(1)} /{" "}
            {program.requiredUnits.toFixed(1)} units
          </span>
        </div>

        <Progress
          value={progressPercentage}
          className="h-2"
          indicatorClassName={cn(isExcluded && "bg-muted-foreground/30")}
        />

        <div className="flex justify-end text-xs">
          <span
            className={cn(
              "font-medium",
              isExcluded ? "text-muted-foreground" : "text-brand"
            )}
          >
            {progressPercentage.toFixed(1)}%
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onViewRequirements}
          disabled={!program.requirements || program.requirements.length === 0}
          className="w-full text-xs h-fit hover:bg-transparent text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed pb-4"
        >
          <Info className="h-3 w-3" />
          {program.requirements && program.requirements.length > 0
            ? "View Requirements"
            : "No Requirements"}
        </Button>
      </div>
    </Card>
  );
}

function RequirementCard({
  requirement,
}: {
  requirement: NonNullable<ProgramEntry["requirements"]>[0];
}) {
  const progressPercentage =
    requirement.requiredUnits > 0
      ? Math.min(
          (requirement.completedUnits / requirement.requiredUnits) * 100,
          100
        )
      : 0;

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
            </p>
          </div>
        </div>

        <CircularProgress
          value={progressPercentage}
          fillColor="brand"
          size="normal"
        />
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
        <ResponsiveDialogBody className="flex flex-col gap-4">
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
