"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm, UseFormProps } from "react-hook-form";
import { z } from "zod";

export function useFormValidation<T extends z.ZodSchema<any, any, any>>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, "resolver">
) {
  const methods = useForm<z.infer<T>>({
    mode: "onTouched",
    context: schema,
    resolver: zodResolver(schema) as Resolver<z.infer<T>>,
    ...options,
  });

  return methods;
}
