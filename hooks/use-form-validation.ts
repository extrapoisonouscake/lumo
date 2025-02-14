"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { z } from "zod";
export function useFormValidation<T extends z.Schema<any, any>>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<typeof schema>>, "resolver">
) {
  const methods = useForm<z.infer<typeof schema>>({
    mode: "onTouched",
    context: schema,
    resolver: zodResolver(schema),
    ...options,
  });

  return methods;
}
