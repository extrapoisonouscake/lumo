"use client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
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
  const Icon = showPassword ? EyeOffIcon : EyeIcon;

  return (
    <FormInput
      {...props}
      type={showPassword ? "text" : "password"}
      placeholder="········"
      label={label}
      rightIcon={<Icon className="cursor-pointer size-4 opacity-50" />}
      rightIconContainerProps={{
        className: "cursor-pointer",
        onClick: () => setShowPassword(!showPassword),
      }}
    />
  );
}
