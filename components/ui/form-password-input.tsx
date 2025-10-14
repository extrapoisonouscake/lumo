"use client";
import {
  ViewOffSolidRounded,
  ViewSolidRounded,
} from "@hugeicons-pro/core-solid-rounded";
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
  const Icon = showPassword ? ViewOffSolidRounded : ViewSolidRounded;

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
