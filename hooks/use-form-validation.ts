"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { z } from "zod";
export function useFormValidation<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  options?: Omit<UseFormProps<z.infer<typeof schema>>, "resolver">
) {
  const methods = useForm<z.infer<typeof schema>>({
    mode: "onTouched",
    resolver: zodResolver(schema),
    ...options,
  });

  return methods;
}
