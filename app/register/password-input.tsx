import { FormPasswordInput } from "@/components/ui/form-password-input";
import { Check, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
const zodString = z.string();
const passwordRequirements = [
  {
    label: "At least 8 characters",
    test: zodString.min(8),
  },
  {
    label: "Contains a number",
    test: zodString.regex(/\d/),
  },
  {
    label: "Contains an uppercase and a lowercase letter",
    test: zodString.regex(/[a-z]/).regex(/[A-Z]/),
  },
  {
    label: "Contains a special character",
    test: zodString.regex(/[^A-Za-z0-9]/),
  },
];
export const passwordZodType = zodString.refine((value) => {
  try {
    for (const requirement of Object.values(passwordRequirements)) {
      requirement.test.parse(value);
    }
    return true;
  } catch {
    return false;
  }
});

const PASSWORD_NAME = "fields.password";
export function RegistrationFormPasswordInput() {
  const { watch } = useFormContext();
  const value = watch(PASSWORD_NAME);
  return (
    <div className="flex flex-col gap-2">
      <FormPasswordInput required name={PASSWORD_NAME} />

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
