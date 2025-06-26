import { cn } from "@/helpers/cn";
import { RegistrationStep } from "./form";

const STEPS = ["Personal Information", "Address", "Security"];
export function RegistrationStepsBar({
  currentStep,
  setCurrentStep,
  maxVisitedStep,
}: {
  currentStep: RegistrationStep;
  setCurrentStep: (newStep: RegistrationStep) => void;
  maxVisitedStep: RegistrationStep;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 relative">
      <div className="h-[2px] flex-1 bg-muted w-full absolute left-0 top-[1.125rem]" />
      {STEPS.map((step, index) => {
        const allowClick = maxVisitedStep >= index && currentStep !== index;
        return (
          <div
            key={index}
            className={cn("flex items-center gap-1 flex-col relative", {
              "cursor-pointer": allowClick,
            })}
            onClick={() => (allowClick ? setCurrentStep(index) : undefined)}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  "rounded-full size-8 flex items-center justify-center bg-muted text-sm box-content border-[3px] border-background",
                  {
                    "bg-primary text-primary-foreground": currentStep >= index,
                  }
                )}
              >
                {index + 1}
              </div>
            </div>
            <p className="max-w-[10ch] text-center text-sm">{step}</p>
          </div>
        );
      })}
    </div>
  );
}
