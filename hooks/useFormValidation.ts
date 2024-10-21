"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
export function useFormValidation<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  const methods = useForm<z.infer<typeof schema>>({
    mode: "onTouched",
    resolver: zodResolver(schema),
  });

  return methods;
}
