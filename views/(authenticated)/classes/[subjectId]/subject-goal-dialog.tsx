"use client";
import { Haptics } from "@capacitor/haptics";
import NumberFlow, { continuous } from "@number-flow/react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectGoal } from "@/db/schema";
import { cn } from "@/helpers/cn";
import { getGradeInfo } from "@/helpers/grades";
import { useFormValidation } from "@/hooks/use-form-validation";
import { GetSubjectInfoResponse } from "@/lib/trpc/routes/myed/subjects";
import {
  SubjectGoalSchema,
  subjectGoalSchema,
} from "@/lib/trpc/routes/myed/subjects/public";
import { Assignment, SubjectSummary } from "@/types/school";
import { queryClient, trpc } from "@/views/trpc";
import {
  Alert02StrokeRounded,
  Cancel01StrokeRounded,
  Drag02StrokeRounded,
  DragDropStrokeRounded,
  PercentStrokeRounded,
  StarStrokeRounded,
  Target02StrokeRounded,
  Tick02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import CircularSlider from "@/components/ui/charts/circular-slider";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { AverageGoalOutcome, computeGoalStatus } from "./helpers";
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

const MotionHugeiconsIcon = motion.create(HugeiconsIcon);

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
  const defaultValues = useMemo(() => {
    return {
      desiredAverage: initialGoal?.desiredAverage ?? currentAverage,
      minimumScore: initialGoal?.minimumScore,
      categoryId: initialGoal?.categoryId,
    };
  }, [initialGoal, currentAverage]);
  const methods = useFormValidation(subjectGoalSchema, { defaultValues });

  const {
    desiredAverage,
    minimumScore: minimumScoreString,
    categoryId,
  } = methods.watch();
  const [areInitialValuesSet, setAreInitialValuesSet] = useState(!!initialGoal);
  console.log({ minimumScoreString }, methods.formState.errors);
  const { isCalculated, isAchievable, ...result } = useMemo(() => {
    if (!minimumScoreString || !categoryId)
      return {
        isCalculated: false,
        isAchievable: false,
        outcome: AverageGoalOutcome.Unknown,
        neededAssignmentsCount: undefined,
      };

    // Convert string values to numbers for calculations
    const minimumScore = Number(minimumScoreString);
    return computeGoalStatus({
      assignments,
      categories,
      currentAverage,
      desiredAverage,
      minimumScore,
      categoryId,
    });
  }, [assignments, desiredAverage, minimumScoreString, categoryId]);
  const resetForm = () => {
    methods.reset({
      desiredAverage: currentAverage,
      //@ts-ignore
      minimumScore: "",
      //@ts-ignore
      categoryId: "",
    });
    setAreInitialValuesSet(false);
  };
  const onSave = async (data: SubjectGoalSchema | undefined) => {
    if (typeof data === "object") {
      const isValid = await methods.trigger(undefined, { shouldFocus: true });

      if (!isValid) {
        return;
      }

      // Ensure required fields are present before converting to API format
      if (!data.desiredAverage) {
        methods.setError("desiredAverage", {
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
          desiredAverage: data.desiredAverage,
          minimumScore: Number(data.minimumScore!),
        }
      : undefined;
    const oldData = queryClient.getQueryData<GetSubjectInfoResponse>(key);

    queryClient.setQueryData<GetSubjectInfoResponse>(key, (oldData) => ({
      ...oldData!,
      goal: goalData,
    }));
    onOpenChange(false);
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
      <ResponsiveDialogContent className="gap-0">
        <ResponsiveDialogHeader className="pb-3">
          <ResponsiveDialogTitle>Set Goal</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Calculate how many grades you need to reach your desired average.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="gap-4 pb-0">
          <Form className="gap-4" {...methods} onSubmit={onSave}>
            {areInitialValuesSet && (
              <>
                <Controller
                  control={methods.control}
                  name="desiredAverage"
                  render={({ field: { onChange, value } }) => (
                    <div
                      className="z-10 relative [&_path]:transition-[fill] flex justify-center items-center -mb-19 -mt-4"
                      onTouchStart={() => Haptics.selectionStart()}
                    >
                      <div className="absolute flex flex-col justify-center items-center -z-[1] top-[calc(50%-7px)] left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <NumberFlow
                          className={cn(
                            "[&_]:leading-none text-6xl font-semibold tabular-nums transition-[font-size]"
                          )}
                          plugins={[continuous]}
                          value={value}
                          style={{
                            //@ts-ignore
                            "--number-flow-char-height": "0.8em",
                          }}
                        />
                        <span className="text-muted-foreground leading-none text-lg">
                          / 100
                        </span>
                      </div>
                      <div data-vaul-no-drag>
                        <CircularSlider
                          size={230}
                          trackWidth={14}
                          minValue={0}
                          maxValue={100}
                          startAngle={70}
                          handleSize={16}
                          handleRenderer={({ position }) => {
                            const SIZE = 32;
                            const SHADOW_PADDING = 10; // Padding to accommodate shadow blur
                            const FOREIGN_OBJECT_SIZE =
                              SIZE + SHADOW_PADDING * 2;
                            return (
                              <foreignObject
                                width={FOREIGN_OBJECT_SIZE}
                                height={FOREIGN_OBJECT_SIZE}
                                x={position.x - FOREIGN_OBJECT_SIZE / 2}
                                y={position.y - FOREIGN_OBJECT_SIZE / 2}
                              >
                                <div
                                  style={{
                                    width: FOREIGN_OBJECT_SIZE,
                                    height: FOREIGN_OBJECT_SIZE,
                                    padding: SHADOW_PADDING,
                                    boxSizing: "border-box",
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="shadow-[0_0_10px_rgba(0,0,0,0.2)]! dark:shadow-[0_0_10px_rgba(255,255,255,0.2)]! clickable rounded-full group bg-background flex items-center justify-center"
                                    style={{
                                      width: SIZE,
                                      height: SIZE,
                                    }}
                                  >
                                    <HugeiconsIcon
                                      icon={DragDropStrokeRounded}
                                      className="size-5 [&>path]:stroke-[3]! transition-opacity group-hover:opacity-50"
                                    />
                                  </button>
                                </div>
                              </foreignObject>
                            );
                          }}
                          secondaryHandleRenderer={({ position }) => {
                            const SIZE = 24;
                            return (
                              <foreignObject
                                width={SIZE}
                                height={SIZE}
                                x={position.x - SIZE / 2}
                                y={position.y - SIZE / 2}
                              >
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    methods.setValue(
                                      "desiredAverage",
                                      currentAverage
                                    );
                                  }}
                                  style={{ width: SIZE, height: SIZE }}
                                  className="clickable rounded-full group bg-background border-[1.5px] flex items-center justify-center"
                                >
                                  <HugeiconsIcon
                                    icon={StarStrokeRounded}
                                    className="size-3 [&>path]:stroke-[2.5]! transition-opacity group-hover:opacity-70 text-muted-foreground"
                                    data-auto-stroke-width="true"
                                  />
                                </div>
                              </foreignObject>
                            );
                          }}
                          endAngle={290}
                          angleType={{
                            direction: "cw",
                            axis: "-y",
                          }}
                          onControlFinished={() => Haptics.selectionEnd()}
                          handle1={{
                            value,
                            onChange: (newValue) => {
                              const roundedValue = Math.round(newValue);
                              if (roundedValue !== value) {
                                Haptics.selectionChanged();
                                onChange(roundedValue);
                              }
                            },
                          }}
                          handle2={{ value: currentAverage }}
                          arcColor={getGradeInfo(value)!.plainColor}
                          arcBackgroundClassName="fill-zinc-200 dark:fill-zinc-800"
                        />
                      </div>
                    </div>
                  )}
                />

                <motion.div
                  className={cn(
                    "z-20 relative h-[21px] text-muted-foreground justify-center w-full flex items-center gap-2 text-sm transition-colors",
                    {
                      "text-destructive": isCalculated && !isAchievable,
                      "text-green-600": isCalculated && isAchievable,
                    }
                  )}
                  key={`${result.outcome}-${isCalculated}`} // Important: Use a key to force re-render and trigger animation on text change
                  initial={{ opacity: 0, transform: "translateY(10px)" }}
                  animate={{ opacity: 1, transform: "translateY(0)" }}
                  exit={{ opacity: 0, transform: "translateY(10px)" }} // For animating out
                  transition={{ duration: 0.5 }}
                >
                  <MotionHugeiconsIcon
                    icon={
                      desiredAverage === currentAverage
                        ? Drag02StrokeRounded
                        : isCalculated && !isAchievable
                          ? Alert02StrokeRounded
                          : Target02StrokeRounded
                    }
                    layout
                    initial={false}
                    className="size-4 min-w-4"
                  />

                  {desiredAverage !== currentAverage ? (
                    result.outcome == AverageGoalOutcome.Unknown ? (
                      <p>Enter a minimum score for the category.</p>
                    ) : !isAchievable ? (
                      <p>Too many grades needed.</p>
                    ) : result.outcome ===
                      AverageGoalOutcome.AlreadyAchieved ? (
                      <p>Goal achieved!</p>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AnimatePresence initial={false}>
                          <motion.span key="need" layout="position">
                            Need{" "}
                          </motion.span>
                          <NumberFlow
                            key="number"
                            value={result.neededAssignmentsCount!}
                          />
                          <motion.span key="more" layout="position">
                            {" "}
                            more grade
                            {result.neededAssignmentsCount === 1 ? "" : "s"} of
                            at least {minimumScoreString}%.
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    )
                  ) : (
                    <p>Start dragging the slider to set your goal average.</p>
                  )}
                </motion.div>
              </>
            )}
            <div className="flex flex-col gap-4 z-30 relative">
              <FormSelect
                label="Category"
                name="categoryId"
                placeholder="Select a category..."
                options={categories.map((category) => ({
                  label: `${category.name}${category.weight ? ` (${category.weight}%)` : ``}`,
                  value: category.id,
                }))}
              />

              <FormInput
                leftIcon={<HugeiconsIcon icon={PercentStrokeRounded} />}
                label="Minimum Score"
                description="The minimum grade you think you can achieve on future assignments in this category."
                name="minimumScore"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="e.g., 80"
              />
            </div>
          </Form>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter className="sm:flex-row-reverse">
          <Button
            leftIcon={
              areInitialValuesSet ? (
                <HugeiconsIcon icon={Tick02StrokeRounded} />
              ) : undefined
            }
            disabled={!methods.formState.isValid || !methods.formState.isDirty}
            onClick={() => {
              if (areInitialValuesSet) {
                methods.handleSubmit(onSave)();
              } else {
                setAreInitialValuesSet(true);
              }
            }}
            className="w-full sm:w-auto min-h-10"
          >
            {areInitialValuesSet ? "Save" : "Continue"}
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto min-h-10"
            onClick={() => {
              if (initialGoal) {
                onSave(undefined);
              }
              resetForm();
              onOpenChange(false);
            }}
            leftIcon={
              initialGoal ? (
                <HugeiconsIcon icon={Cancel01StrokeRounded} />
              ) : undefined
            }
          >
            {initialGoal ? "Reset" : "Cancel"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function SubjectGoalButtonSkeleton() {
  return (
    <Skeleton className="size-4 rounded-full absolute z-10 -top-1 -right-3.5" />
  );
}
