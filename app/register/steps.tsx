import { cn } from "@/helpers/cn";
import { RegistrationStep } from "./form";

const STEPS = ["Personal Information", "Address", "Security"];
export function RegistrationStepsBar({
  currentStep,
  setCurrentStep,
}: {
  currentStep: RegistrationStep;
  setCurrentStep: (newStep: RegistrationStep) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 relative">
      <div className="h-[2px] flex-1 bg-muted w-full absolute left-0 top-7" />
      {STEPS.map((step, index) => (
        <div
          className="flex items-center gap-2 cursor-pointer flex-col relative"
          onClick={() => setCurrentStep(index)}
        >
          <div className="flex items-center">
            <div
              className={cn(
                "rounded-full size-12 flex items-center justify-center bg-muted text-lg box-content border-[3px] border-background",
                { "bg-primary text-primary-foreground": currentStep === index }
              )}
            >
              {index + 1}
            </div>
          </div>
          <p className="text-sm max-w-[10ch] text-center">{step}</p>
        </div>
      ))}
    </div>
  );
}
