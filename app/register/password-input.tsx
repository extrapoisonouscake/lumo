import {
  FormPasswordInput,
  FormPasswordInputProps,
} from "@/components/ui/form-password-input";
import { passwordRequirements } from "@/lib/zod";
import { Check, X } from "lucide-react";
import { useFormContext } from "react-hook-form";

export function ExtendedFormPasswordInput(props: FormPasswordInputProps) {
  const { watch } = useFormContext();
  const value = watch(props.name);
  return (
    <div className="flex flex-col gap-2">
      <FormPasswordInput required {...props} />

      {value && (
        <ul className="text-sm space-y-1">
          {passwordRequirements.map((requirement, i) => {
            const isValid = requirement.test.safeParse(value).success;
            const Icon = isValid ? Check : X;
            return (
              <li key={i} className="flex items-center gap-2">
                <span className={isValid ? "text-green-600" : "text-red-500"}>
                  <Icon className="size-4" />
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
