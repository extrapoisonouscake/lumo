import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import { useRecentAssignments } from "@/hooks/trpc/use-subjects-assignments";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useUpdateGenericUserSetting } from "@/hooks/trpc/use-update-generic-user-setting";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { Assignment, AssignmentStatus, Subject } from "@/types/school";
import { getAssignmentURL } from "@/views/(authenticated)/classes/[subjectId]/(assignments)/helpers";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { Tick02StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import {
  ArrowLeft02StrokeStandard,
  ArrowRight02StrokeStandard,
} from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { PopoverContentProps, StepType, useTour } from "@reactour/tour";
import { useQuery } from "@tanstack/react-query";
import { lazy, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CircularProgress } from "../misc/circular-progress";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
interface Step extends StepType {
  pathname: string;
  title?: string;
  selector: string;
  content: string;
  shouldClick?: boolean;
}
const TourProviderComponent = lazy(() =>
  import("@reactour/tour").then((mod) => ({ default: mod.TourProvider }))
);
export function TourProvider({ children }: { children: React.ReactNode }) {
  const settings = useUserSettings(false);

  const subjects = useSubjectsData();
  const assignments = useRecentAssignments(subjects.data?.subjects.main);
  const transcript = useQuery(
    getTRPCQueryOptions(trpc.myed.transcript.getGraduationSummary)()
  );
  const bestAssignment = useMemo(() => {
    return (
      assignments.data.find(
        (assignment) => assignment.status === AssignmentStatus.Graded
      ) ?? assignments.data[0]
    );
  }, [assignments.data]);
  const bestSubject = useMemo(() => {
    let subject = subjects.data?.subjects.main[0];
    if (bestAssignment) {
      const foundSubject = subjects.data?.subjects.main.find(
        (subject) => subject.id === bestAssignment?.subject.id
      );
      if (foundSubject) {
        subject = foundSubject;
      }
    }
    return subject;
  }, [subjects.data?.subjects.main, bestAssignment]);
  //   if (!settings || settings.hasCompletedTour) return children;
  return (
    <>
      <Tour bestSubject={bestSubject} bestAssignment={bestAssignment} />
      {children}
    </>
  );
}
function Tour({
  bestSubject,
  bestAssignment,
}: {
  bestSubject: Subject | undefined;
  bestAssignment: Assignment | undefined;
}) {
  const steps = useMemo(() => {
    return [
      {
        title: "Simple!",
        selector: "#edit-subjects-list",
        pathname: "/classes",

        content: "You can rearrange and hide your classes.",
      },
      ...(bestSubject
        ? [
            {
              title: "Simple!",
              selector: "#subject-attendance-button",
              pathname: getSubjectPageURL("current")(bestSubject),

              content: "View absences.",
            },
            {
              title: "Simple!",
              selector: ".subject-summary-grade",
              pathname: getSubjectPageURL("current")(bestSubject),
              shouldClick: true,
              content: "Set average grade goals for classes.",
            },
          ]
        : []),
      ...(bestAssignment
        ? [
            {
              title: "Simple!",
              content:
                "View your assignments with ease and upload homework on your phone.",
              selector: ".assignment-page-header",
              pathname: getAssignmentURL(bestAssignment, bestSubject!),
            },
            {
              title: "Simple!",
              content:
                "View your assignments with ease and upload homework on your phone.",
              selector: ".assignment-page-details-section",
              pathname: getAssignmentURL(bestAssignment, bestSubject!),
            },
          ]
        : []),
      {
        title: "Simple!",
        content: "Use the power of fully customizable widgets.",
        selector: ".widgets-grid",
        pathname: "/",
      },
      {
        title: "Simple!",
        content: "View your transcript and graduation requirements.",
        selector: ".graduation-requirements-list",
        pathname: "/transcript",
      },
      {
        title: "Simple!",
        content: "Customize the app how you want.",
        selector: ".settings-page",
        pathname: "/settings",
      },
      {
        title: "Simple!",
        content: "Receive notifications when your assignments are due.",
        selector: ".notifications-controls",
        pathname: "/settings",
      },
    ];
  }, [bestSubject, bestAssignment]);

  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const updateUserSettingMutation = useUpdateGenericUserSetting();
  return (
    <TourProviderComponent
      steps={steps}
      ContentComponent={(props) => <PopoverContent {...props} steps={steps} />}
      styles={{
        popover: (base) => ({
          ...base,
          "--reactour-accent": "hsl(var(--brand))",
          borderRadius: "var(--radius-xl)",
          padding: "calc(var(--spacing) * 4)",
        }),
        maskArea: (base) => ({ ...base, rx: 12 }),
        maskWrapper: (base) => base,
        badge: (base) => ({ ...base, left: "auto", right: "-0.8125em" }),
        controls: (base) => ({ ...base, marginTop: 100 }),
        close: (base) => ({
          ...base,
          right: "auto",
          left: "calc(var(--spacing) * 4)",
          top: "calc(var(--spacing) * 4)",
        }),
      }}
      disableInteraction
    >
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          updateUserSettingMutation.mutateAsync({
            key: "hasCompletedTour",
            value: true,
          });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tour</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Would you like to take a tour of the app?
          </p>
          <DialogFooter className="gap-y-2">
            <TakeTourButton firstStep={steps[0]!} />

            <DialogClose asChild>
              <Button variant="outline">Skip</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TourProviderComponent>
  );
}
function TakeTourButton({ firstStep }: { firstStep: Step }) {
  const { setIsOpen } = useTour();
  const navigate = useNavigate();
  return (
    <DialogClose asChild>
      <Button
        variant="brand"
        onClick={() => {
          navigate(firstStep.pathname);
          waitForSelector(firstStep.selector).then(() => {
            setIsOpen(true);
          });
        }}
      >
        Take tour
      </Button>
    </DialogClose>
  );
}
function PopoverContent({
  steps,
  ...props
}: PopoverContentProps & { steps: Step[] }) {
  const { setIsOpen, setSteps } = useTour();

  console.log("steps", steps);
  const [currentStep, setCurrentStep] = useState(props.currentStep);
  const step = steps[currentStep]!;

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const processCrossPageStep = (stepIndex: number, step: Step) => {
    const proceedToNextStep = () => {
      setCurrentStep(stepIndex);
      props.setCurrentStep(stepIndex);
      if (step.shouldClick) {
        (
          document.querySelector(step.selector) as HTMLElement | undefined
        )?.click();
      }
    };
    console.log(
      new URL(step.pathname, window.location.origin).pathname,
      window.location.pathname
    );
    if (
      window.location.pathname ===
      new URL(step.pathname, window.location.origin).pathname
    ) {
      proceedToNextStep();
      return;
    }
    setIsLoading(true);
    waitForSelector(step.selector)
      .then(() => {
        setSteps?.({ ...steps });
        proceedToNextStep();
      })
      .catch(() => {
        toast.error("Unexpected error occurred.");
        setIsOpen(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
    navigate(step.pathname);
  };
  const isFirstStep = currentStep === 0;
  const isLastStep = steps.length - 1 === props.currentStep;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-0.5">
          {step.title && (
            <h3 className="text-lg font-semibold">{step.title}</h3>
          )}
          <CircularProgress
            values={[
              {
                value: ((currentStep + 1) / steps.length) * 100,
                className: "text-brand",
              },
            ]}
            thickness={1.5}
            letter={`${currentStep + 1}`}
            size="normal"
          />
        </div>
        <p className="text-sm">{step.content}</p>
      </div>
      <div className="flex justify-between flex-wrap gap-6">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={() => {
              const prevStepIndex = currentStep - 1;
              const prevStep = steps[prevStepIndex]!;
              processCrossPageStep(prevStepIndex, prevStep);
            }}
            size="sm"
          >
            <HugeiconsIcon icon={ArrowLeft02StrokeStandard} />
          </Button>
        )}
        <div className="flex justify-end gap-2">
          {!isLastStep && (
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              size="sm"
            >
              Skip
            </Button>
          )}
          <Button
            variant="brand"
            disabled={isLoading}
            onClick={
              isLastStep
                ? () => {
                    setIsOpen(false);
                  }
                : () => {
                    const nextStepIndex = currentStep + 1;
                    const nextStep = steps[nextStepIndex]!;
                    processCrossPageStep(nextStepIndex, nextStep);
                    navigate(nextStep.pathname);
                  }
            }
            className="gap-1 pr-2.5"
            size="sm"
            rightIcon={
              <HugeiconsIcon
                icon={
                  isLastStep ? Tick02StrokeRounded : ArrowRight02StrokeStandard
                }
              />
            }
          >
            {isLastStep ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Source - https://stackoverflow.com/a
// Posted by Yong Wang, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-10, License - CC BY-SA 4.0

function waitForSelector(selector: string) {
  return Promise.race([
    new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        return resolve(element);
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }),
    new Promise((_, reject) => setTimeout(reject, 7000)),
  ]);
}
