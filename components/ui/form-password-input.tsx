"use client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { FormInput, FormInputProps } from "./form-input";

export function FormPasswordInput({
  label = "Password",
  ...props
}: Omit<FormInputProps, "label"> & { label?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = showPassword ? EyeOffIcon : EyeIcon;

  return (
    <FormInput
      shouldShowError={false}
      {...props}
      type={showPassword ? "text" : "password"}
      placeholder="········"
      label={label}
      rightIcon={
        <Icon
          className="cursor-pointer size-4 opacity-50"
          onClick={() => setShowPassword(!showPassword)}
        />
      }
    />
  );
}
