import { TRPCError } from "@trpc/server";

export function isTRPCError(error: unknown): error is TRPCError {
  return error instanceof TRPCError;
}
