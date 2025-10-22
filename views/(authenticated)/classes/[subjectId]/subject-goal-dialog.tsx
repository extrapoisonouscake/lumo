"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { cn } from "@/helpers/cn";
import { useFormValidation } from "@/hooks/use-form-validation";
import {
  GetSubjectInfoResponse,
  SubjectGoal,
} from "@/lib/trpc/routes/myed/subjects";
import {
  SubjectGoalSchema,
  getSubjectGoalSchema,
} from "@/lib/trpc/routes/myed/subjects/public";
import { Assignment, AssignmentStatus, SubjectSummary } from "@/types/school";
import { queryClient, trpc } from "@/views/trpc";
import {
  Alert02StrokeRounded,
  PercentStrokeRounded,
  Target02StrokeRounded,
  Tick02StrokeRounded,
  ViewStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { ArrowRight02StrokeStandard } from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export function SubjectGoalDialog({
  isOpen,
  onOpenChange,
  assignments,
  categories,
  currentAverage,
  initialGoal,
  subjectId,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignments: Assignment[];
  categories: SubjectSummary["academics"]["categories"];
  currentAverage: number;
  initialGoal?: SubjectGoal;
  subjectId: string;
}) {
  const setSubjectGoalMutation = useMutation(
    trpc.myed.subjects.setSubjectGoal.mutationOptions()
  );
  const schema = useMemo(
    () => getSubjectGoalSchema(currentAverage),
    [currentAverage]
  );
  const methods = useFormValidation(schema, {
    defaultValues: {
      ...initialGoal,
      categoryId: initialGoal?.categoryId ?? categories[0]!.id,
    },
  });
  const { value: desiredAverage, minimumScore, categoryId } = methods.watch();
  const result = useMemo(() => {
    if (!desiredAverage || !minimumScore || !categoryId) return null;

    const categoryAssignmentsCount = assignments.filter(
      (assignment) =>
        assignment.status === AssignmentStatus.Graded &&
        assignment.categoryId === categoryId
    ).length;
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return Infinity;
    const categoryWeight = category.derivedWeight;
    if (!categoryWeight) return Infinity;
    const categoryWeightPercentage = categoryWeight / 100;
    const categoryAverage = category.average?.mark ?? 100;

    const neededAssignmentsCount =
      (categoryAssignmentsCount * (currentAverage - desiredAverage)) /
      categoryWeightPercentage /
      (categoryAverage -
        minimumScore +
        (desiredAverage - currentAverage) / categoryWeightPercentage);
    if (neededAssignmentsCount > 10 || neededAssignmentsCount < 0)
      return Infinity;
    return Math.ceil(neededAssignmentsCount);
  }, [assignments, desiredAverage, minimumScore, categoryId]);
  const [isBreakdownShown, setIsBreakdownShown] = useState(!!initialGoal);
  const onSave = async (data: SubjectGoalSchema | undefined) => {
    const key = trpc.myed.subjects.getSubjectInfo.queryKey({
      id: subjectId,
      year: "current",
    });
    const oldData = queryClient.getQueryData<GetSubjectInfoResponse>(key);

    queryClient.setQueryData<GetSubjectInfoResponse>(key, (oldData) => ({
      ...oldData!,
      goal: data,
    }));
    if (isBreakdownShown) {
      onOpenChange(false);
    } else {
      setIsBreakdownShown(true);
      return;
    }
    if (data === undefined) {
      methods.reset({
        //@ts-ignore
        value: "",
        //@ts-ignore
        minimumScore: "",
        categoryId: categories[0]!.id,
      });
      setIsBreakdownShown(false);
    }

    try {
      await setSubjectGoalMutation.mutateAsync({
        subjectId,
        goal: data,
      });
    } catch (error) {
      queryClient.setQueryData<GetSubjectInfoResponse>(key, oldData);
      throw error;
    }
  };

  const isCalculated = methods.formState.isValid;
  const isAchievable = isCalculated && result !== Infinity;
  const isGoalAchieved = result === 0;
  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button
          size="smallIcon"
          className={cn(
            "size-6 absolute -top-2 -right-4.5 text-muted-foreground group-hover:text-accent-foreground",
            isCalculated &&
              !isAchievable &&
              "text-red-500/80 group-hover:text-red-500/90"
          )}
          variant="ghost"
        >
          <HugeiconsIcon
            icon={
              isCalculated && !isAchievable
                ? Alert02StrokeRounded
                : Target02StrokeRounded
            }
          />
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader className="pb-1">
          <ResponsiveDialogTitle>Goal</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="gap-6">
          <Form className="gap-6" {...methods} onSubmit={onSave}>
            {isBreakdownShown && (
              <Card
                className={cn(
                  "px-5 py-4 rounded-2xl gap-2 justify-center items-center relative overflow-hidden transition-colors",

                  { "border-red-500/20 bg-red-500/5": !isAchievable },
                  { "border-green-600/20 bg-green-600/5": isAchievable }
                )}
              >
                <div className="flex flex-col gap-1 items-center w-full">
                  <div className="flex gap-3 items-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Current
                      </span>
                      <p className="text-2xl font-semibold tabular-nums">
                        {currentAverage}%
                      </p>
                    </div>
                    <HugeiconsIcon
                      icon={ArrowRight02StrokeStandard}
                      data-auto-stroke-width
                      strokeWidth={2.5}
                      className={cn(
                        "size-7 transition-colors translate-y-2",
                        !isAchievable ? "text-red-500" : "text-green-600"
                      )}
                    />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Goal
                      </span>
                      <p
                        className={cn(
                          "text-3xl font-bold tabular-nums transition-colors",
                          !isAchievable ? "text-red-500" : "text-green-600"
                        )}
                      >
                        {desiredAverage}%
                      </p>
                    </div>
                  </div>
                </div>

                {isCalculated && (
                  <div
                    className={cn(
                      "flex items-center font-medium gap-1.5 text-sm",
                      !isAchievable ? "text-red-500" : "text-green-600"
                    )}
                  >
                    <HugeiconsIcon
                      icon={
                        !isAchievable
                          ? Alert02StrokeRounded
                          : Target02StrokeRounded
                      }
                      className="size-4"
                    />
                    <span>
                      {!isAchievable
                        ? "This goal cannot be achieved"
                        : isGoalAchieved
                          ? "Goal achieved!"
                          : `Need ${result} more grade${result === 1 ? "" : "s"} of at least ${minimumScore}%`}
                    </span>
                  </div>
                )}
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                triggerClassName="sm:col-span-2"
                label="Category"
                name="categoryId"
                options={categories.map((category) => ({
                  label: `${category.name}${category.derivedWeight ? ` (${category.derivedWeight}%)` : ``}`,
                  value: category.id,
                }))}
              />

              <FormInput
                leftIcon={
                  <HugeiconsIcon
                    className={cn({
                      "text-red-500!": methods.formState.errors.value,
                    })}
                    icon={Target02StrokeRounded}
                  />
                }
                label="Goal (out of 100)"
                name="value"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g., 85"
              />

              <FormInput
                leftIcon={<HugeiconsIcon icon={PercentStrokeRounded} />}
                label="Minimum Score (%)"
                name="minimumScore"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="e.g., 80"
              />
            </div>

            <ResponsiveDialogFooter className="p-0 sm:flex-row-reverse">
              <Button
                leftIcon={
                  initialGoal ? (
                    <HugeiconsIcon icon={Tick02StrokeRounded} />
                  ) : (
                    <HugeiconsIcon icon={ViewStrokeRounded} />
                  )
                }
                type="submit"
                className="w-full sm:w-auto"
              >
                {initialGoal ? "Done" : "Preview"}
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  if (initialGoal) {
                    onSave(undefined);
                  }
                  onOpenChange(false);
                }}
              >
                {initialGoal ? "Reset" : "Cancel"}
              </Button>
            </ResponsiveDialogFooter>
          </Form>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
