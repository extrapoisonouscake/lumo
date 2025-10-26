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
import { Skeleton } from "@/components/ui/skeleton";
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
  PlusSignStrokeRounded,
  Target02StrokeRounded,
  Tick02StrokeRounded,
  ViewStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { ArrowRight02StrokeStandard } from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
const getOptionalNumberString = (minValue = 0) =>
  z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(
      z.union([
        z.undefined(),
        z.string().refine(
          (val) => {
            const num = Number(val);
            return !isNaN(num) && num > minValue && num <= 100;
          },
          { message: `Must be a number between ${minValue} and 100` }
        ),
      ])
    );
enum Outcome {
  Achievable = "achievable",
  AlreadyAchieved = "already-achieved",
  ValuesOutOfRange = "values-out-of-range",
  Unknown = "unknown",
}
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
    () =>
      getSubjectGoalSchema(currentAverage).extend({
        value: getOptionalNumberString(currentAverage),
        minimumScore: getOptionalNumberString(0),
      }),
    [currentAverage]
  );
  const methods = useFormValidation(schema, {
    defaultValues: {
      value: initialGoal?.value?.toString() ?? "",
      minimumScore: initialGoal?.minimumScore?.toString() ?? "",
      categoryId: initialGoal?.categoryId ?? categories[0]!.id,
    },
  });

  const {
    value: desiredAverageString,
    minimumScore: minimumScoreString,
    categoryId,
  } = methods.watch();
  const resetForm = () => {
    methods.reset({
      //@ts-ignore
      value: "",
      //@ts-ignore
      minimumScore: "",
      categoryId: categories[0]!.id,
    });
  };
  const result = useMemo(() => {
    if (!desiredAverageString || !minimumScoreString || !categoryId)
      return { outcome: Outcome.Unknown };

    // Convert string values to numbers for calculations
    const desiredAverage = Number(desiredAverageString);
    const minimumScore = Number(minimumScoreString);

    const categoryAssignmentsCount = assignments.filter(
      (assignment) =>
        assignment.status === AssignmentStatus.Graded &&
        assignment.categoryId === categoryId
    ).length;
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return { outcome: Outcome.Unknown };
    const categoryWeight = category.derivedWeight;
    if (!categoryWeight) return { outcome: Outcome.Unknown };
    const categoryWeightPercentage = categoryWeight / 100;
    const categoryAverage = category.average?.mark ?? 100;
    const numerator =
      (categoryAssignmentsCount * (currentAverage - desiredAverage)) /
      categoryWeightPercentage;
    const denominator =
      categoryAverage -
      minimumScore +
      (desiredAverage - currentAverage) / categoryWeightPercentage;
    if (numerator > 0) return { outcome: Outcome.AlreadyAchieved };
    if (denominator > 0) {
      return { outcome: Outcome.ValuesOutOfRange };
    }
    const minimumThreshold =
      categoryAverage +
      (desiredAverage - currentAverage) / categoryWeightPercentage;

    // Maximum achievable total average if all future assignments are 100%
    const maxAchievable =
      currentAverage + categoryWeightPercentage * (100 - categoryAverage);
    if (desiredAverage > maxAchievable || minimumScore < minimumThreshold)
      return { outcome: Outcome.ValuesOutOfRange };
    const neededAssignmentsCount = Math.ceil(numerator / denominator);

    if (neededAssignmentsCount > 10)
      return { outcome: Outcome.ValuesOutOfRange };
    return {
      outcome: Outcome.Achievable,
      neededAssignmentsCount: Math.ceil(neededAssignmentsCount),
    };
  }, [assignments, desiredAverageString, minimumScoreString, categoryId]);
  const [isBreakdownShown, setIsBreakdownShown] = useState(!!initialGoal);

  const isCalculated =
    methods.formState.isValid && !!desiredAverageString && !!minimumScoreString;
  const isAchievable = isCalculated && result.outcome === Outcome.Achievable;
  const isAchieved = useMemo(
    () => result.outcome === Outcome.AlreadyAchieved,
    [initialGoal]
  );
  const shouldShowFinalLayout = isBreakdownShown && isCalculated && isAchieved;
  const onSave = async (data: z.infer<typeof schema> | undefined) => {
    if (typeof data === "object") {
      const isValid = await methods.trigger(undefined, { shouldFocus: true });

      if (!isValid) {
        return;
      }

      // Ensure required fields are present before converting to API format
      if (!data.value) {
        methods.setError("value", {
          type: "manual",
          message: "Goal is required",
        });
        return;
      }
      if (!data.minimumScore) {
        methods.setError("minimumScore", {
          type: "manual",
          message: "Minimum score is required",
        });
        return;
      }
    }

    const key = trpc.myed.subjects.getSubjectInfo.queryKey({
      id: subjectId,
      year: "current",
    });

    // Convert string values to numbers for the API
    const goalData: SubjectGoalSchema | undefined = data
      ? {
          categoryId: data.categoryId,
          value: Number(data.value!),
          minimumScore: Number(data.minimumScore!),
        }
      : undefined;
    const oldData = queryClient.getQueryData<GetSubjectInfoResponse>(key);

    if (isBreakdownShown) {
      if (!shouldShowFinalLayout) {
        onOpenChange(false);
      }
    } else {
      setIsBreakdownShown(true);
      return;
    }
    if (data === undefined) {
      resetForm();
      setIsBreakdownShown(false);
    }
    queryClient.setQueryData<GetSubjectInfoResponse>(key, (oldData) => ({
      ...oldData!,
      goal: goalData,
    }));
    try {
      await setSubjectGoalMutation.mutateAsync({
        subjectId,
        goal: goalData,
      });
    } catch (error) {
      queryClient.setQueryData<GetSubjectInfoResponse>(key, oldData);
      throw error;
    }
  };
  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button
          size="smallIcon"
          className={cn(
            "size-6 absolute z-10 -top-2 -right-4.5 text-muted-foreground/60 group-hover:text-accent-foreground",
            { "text-muted-foreground": !!isBreakdownShown },
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
        <ResponsiveDialogHeader className="pb-2">
          <ResponsiveDialogTitle>Goal</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="gap-5">
          {isBreakdownShown && (
            <Card
              className={cn(
                "px-5 py-4 rounded-2xl gap-2 justify-center items-center relative overflow-hidden transition-colors",

                { "border-red-500/20 bg-red-500/5": !isAchievable },
                {
                  "border-muted-foreground/20 bg-muted-foreground/[3%]":
                    isAchievable && !isAchieved,
                },
                {
                  "border-green-600/20 bg-green-600/5":
                    isAchievable && isAchieved,
                }
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
                    <span className="text-xs text-muted-foreground">Goal</span>
                    <p
                      className={cn(
                        "text-3xl font-bold tabular-nums transition-colors",
                        !isAchievable ? "text-red-500" : "text-green-600"
                      )}
                    >
                      {desiredAverageString
                        ? Math.min(100, Number(desiredAverageString))
                        : "??"}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {isCalculated && (
                <div
                  className={cn(
                    "flex items-center font-medium gap-2.5 text-sm",
                    !isAchievable ? "text-red-500" : "text-green-600"
                  )}
                >
                  <HugeiconsIcon
                    icon={
                      !isAchievable
                        ? Alert02StrokeRounded
                        : Target02StrokeRounded
                    }
                    className="size-4 min-w-4"
                  />
                  <span>
                    {!isAchievable
                      ? "Goal cannot be reached, adjust desired average or minimum score"
                      : isAchieved
                        ? "Goal achieved!"
                        : `Need ${result.neededAssignmentsCount} more grade${result.neededAssignmentsCount === 1 ? "" : "s"} of at least ${minimumScoreString}%`}
                  </span>
                </div>
              )}
            </Card>
          )}
          <Form className="gap-4" {...methods} onSubmit={onSave}>
            {!shouldShowFinalLayout && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  formItemClassName="sm:col-span-2"
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
                  label="Goal Average"
                  description="The total average you would like to achieve."
                  name="value"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g., 85"
                />

                <FormInput
                  leftIcon={<HugeiconsIcon icon={PercentStrokeRounded} />}
                  label="Minimum Score"
                  description="Minimum grade per assignment needed to reach your goal average."
                  name="minimumScore"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="e.g., 80"
                />
              </div>
            )}

            <ResponsiveDialogFooter className="p-0 sm:flex-row-reverse">
              {!shouldShowFinalLayout ? (
                <Button
                  leftIcon={
                    isBreakdownShown ? (
                      <HugeiconsIcon icon={Tick02StrokeRounded} />
                    ) : (
                      <HugeiconsIcon icon={ViewStrokeRounded} />
                    )
                  }
                  type="submit"
                  className="w-full sm:w-auto min-h-10"
                >
                  {isBreakdownShown ? "Save Goal" : "Preview"}
                </Button>
              ) : (
                <Button
                  leftIcon={<HugeiconsIcon icon={PlusSignStrokeRounded} />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSave(undefined);
                  }}
                  className="w-full sm:w-auto min-h-10"
                >
                  Create a new goal
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full sm:w-auto min-h-10"
                onClick={() => {
                  if (isBreakdownShown) {
                    onSave(undefined);
                  } else {
                    resetForm();
                  }
                  onOpenChange(false);
                }}
              >
                {isBreakdownShown ? "Reset" : "Cancel"}
              </Button>
            </ResponsiveDialogFooter>
          </Form>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
export function SubjectGoalButtonSkeleton() {
  return (
    <Skeleton className="size-4 rounded-full absolute z-10 -top-1 -right-3.5" />
  );
}
