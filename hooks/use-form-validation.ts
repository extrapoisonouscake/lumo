"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm, UseFormProps } from "react-hook-form";
import { z } from "zod";

type Options<T extends z.ZodSchema<any, any, any>> = Omit<
  UseFormProps<z.infer<T>>,
  "resolver"
>;
export function useFormValidation<T extends z.ZodSchema<any, any, any>>(
  schema: T,
  options?: Options<T> | (() => Options<T>)
) {
  const resolvedOptions = typeof options === "function" ? options() : options;
  const methods = useForm<z.infer<T>>({
    mode: "onTouched",
    context: schema,
    resolver: zodResolver(schema) as Resolver<z.infer<T>>,
    ...resolvedOptions,
  });

  return methods;
}
