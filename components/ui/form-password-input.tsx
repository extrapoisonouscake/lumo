"use client";
import {
  ViewOffStrokeRounded,
  ViewStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { FormInput, FormInputProps } from "./form-input";
export type FormPasswordInputProps = Omit<FormInputProps, "label"> & {
  label?: string;
};
export function FormPasswordInput({
  label = "Password",
  ...props
}: FormPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = showPassword ? ViewOffStrokeRounded : ViewStrokeRounded;

  return (
    <FormInput
      {...props}
      type={showPassword ? "text" : "password"}
      placeholder="········"
      label={label}
      rightIcon={
        <HugeiconsIcon
          icon={Icon}
          className="cursor-pointer size-4 opacity-80"
        />
      }
      rightIconContainerProps={{
        className: "cursor-pointer",
        onClick: () => setShowPassword(!showPassword),
      }}
    />
  );
}
