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
  getSubjectGoalSchema,
  SubjectGoalSchema,
} from "@/lib/trpc/routes/myed/subjects/public";
import { Assignment, SubjectSummary } from "@/types/school";
import { queryClient, trpc } from "@/views/trpc";
import {
  Alert02StrokeRounded,
  PercentStrokeRounded,
  Target02StrokeRounded,
  Tick02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import CircularSlider from "react-circular-slider-svg";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { computeGoalStatus, Outcome } from "./helpers";
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
  const schema = useMemo(
    () =>
      getSubjectGoalSchema(currentAverage).extend({
        minimumScore: getOptionalNumberString(0),
      }),
    [currentAverage]
  );
  const defaultValues = useMemo(() => {
    const categoryId = initialGoal?.categoryId ?? categories[0]!.id;
    return {
      desiredAverage: initialGoal?.desiredAverage ?? currentAverage,
      minimumScore: (initialGoal?.minimumScore ?? 85).toString(),
      categoryId: categoryId,
    };
  }, [initialGoal, categories, currentAverage]);
  const methods = useFormValidation(schema, { defaultValues });

  const {
    desiredAverage,
    minimumScore: minimumScoreString,
    categoryId,
  } = methods.watch();

  const resetForm = () => {
    methods.reset({
      //@ts-ignore
      desiredAverage: currentAverage,
      //@ts-ignore
      minimumScore: "85",
      categoryId: categories[0]!.id,
    });
  };
  const { isCalculated, isAchievable, ...result } = useMemo(() => {
    if (!minimumScoreString || !categoryId)
      return {
        isCalculated: false,
        isAchievable: false,
        outcome: Outcome.Unknown,
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

  const onSave = async (data: z.infer<typeof schema> | undefined) => {
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
    if (data === undefined) {
      resetForm();
    }

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
        <ResponsiveDialogHeader className="pb-2">
          <ResponsiveDialogTitle>Set Goal</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="gap-5">
          <Form className="gap-4" {...methods} onSubmit={onSave}>
            <Controller
              control={methods.control}
              name="desiredAverage"
              render={({ field: { onChange, value } }) => (
                <div
                  className="z-10 relative [&_path]:transition-[fill] flex justify-center items-center -mb-19 -mt-4"
                  onTouchStart={() => Haptics.selectionStart()}
                >
                  <div className="absolute flex flex-col justify-center items-center -z-[1] p-12 rounded-full overflow-hidden top-[calc(50%-7px)] left-1/2 -translate-x-1/2 -translate-y-1/2">
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
                      outerShadow
                      startAngle={70}
                      handleSize={16}
                      endAngle={290}
                      angleType={{
                        direction: "cw",
                        axis: "-y",
                      }}
                      onControlFinished={() => Haptics.selectionEnd()}
                      handle1={{
                        value,
                        onChange: (value) => {
                          Haptics.selectionChanged();
                          onChange(Math.round(value));
                        },
                      }}
                      arcColor={getGradeInfo(value)!.plainColor}
                      arcBackgroundColor="var(--color-zinc-200)"
                    />
                  </div>
                </div>
              )}
            />

            <motion.div
              className={cn(
                "z-20 relative h-[21px] text-muted-foreground justify-center w-full flex items-center gap-2 text-sm transition-colors",
                {
                  "text-red-500": isCalculated && !isAchievable,
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
                  isCalculated && !isAchievable
                    ? Alert02StrokeRounded
                    : Target02StrokeRounded
                }
                layout
                initial={false}
                className="size-4 min-w-4"
              />

              
                {desiredAverage !== currentAverage ? (
                  result.outcome == Outcome.Unknown ? (
                    <p>Enter a minimum score for the category.</p>
                  ) : !isAchievable ? (
                    <p>Too many grades needed.</p>
                  ) : result.outcome === Outcome.AlreadyAchieved ? (
                    <p>Goal already achieved.</p>
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
                          {result.neededAssignmentsCount === 1 ? "" : "s"} of at
                          least {minimumScoreString}%.
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  )
                ) : (
                  <p>Start dragging the slider to set your goal average.</p>
                )}
              
            </motion.div>

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

            <ResponsiveDialogFooter className="p-0 sm:flex-row-reverse">
              <Button
                leftIcon={<HugeiconsIcon icon={Tick02StrokeRounded} />}
                type="submit"
                className="w-full sm:w-auto min-h-10"
              >
                Save
              </Button>

              <Button
                variant="outline"
                className="w-full sm:w-auto min-h-10"
                onClick={(e) => {
                  if (initialGoal) {
                    onSave(undefined);
                  } else {
                    resetForm();
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

export function SubjectGoalButtonSkeleton() {
  return (
    <Skeleton className="size-4 rounded-full absolute z-10 -top-1 -right-3.5" />
  );
}
