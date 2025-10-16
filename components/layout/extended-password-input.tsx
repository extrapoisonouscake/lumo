import {
  FormPasswordInput,
  FormPasswordInputProps,
} from "@/components/ui/form-password-input";
import { getPasswordRequirementsArray } from "@/lib/zod";
import { PasswordRequirements } from "@/types/auth";

import {
  Cancel01StrokeRounded,
  Tick02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useFormContext } from "react-hook-form";

export function ExtendedFormPasswordInput(
  props: FormPasswordInputProps & {
    requirements: PasswordRequirements;
  }
) {
  const { watch } = useFormContext();
  const value = watch(props.name);
  const passwordRequirements = getPasswordRequirementsArray(props.requirements);
  return (
    <div className="flex flex-col gap-2">
      <FormPasswordInput
        autoComplete="new-password"
        shouldShowError={false}
        required
        {...props}
      />

      {value && (
        <ul className="text-sm space-y-1">
          {passwordRequirements.map((requirement, i) => {
            const isValid = requirement.test.safeParse(value).success;
            const Icon = isValid ? Tick02StrokeRounded : Cancel01StrokeRounded;
            return (
              <li key={i} className="flex items-center gap-2">
                <span className={isValid ? "text-green-600" : "text-red-500"}>
                  <HugeiconsIcon icon={Icon} className="size-4" />
                </span>
                {requirement.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
