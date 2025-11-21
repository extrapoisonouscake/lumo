import {
  MAINTENANCE_MODE_ERROR_MESSAGE,
  UNAUTHORIZED_ERROR_MESSAGE,
} from "@/parsing/myed/getMyEd";
import { initTRPC, TRPCError } from "@trpc/server";

import { DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";
import superjson from "superjson";
import type { TRPCContext } from "./context";
const formatError = (shape: DefaultErrorShape, error: TRPCError) => {
  const errorType =
    error.message === MAINTENANCE_MODE_ERROR_MESSAGE
      ? { code: "SERVICE_UNAVAILABLE", httpStatus: 503 }
      : error.message === UNAUTHORIZED_ERROR_MESSAGE
        ? { code: "UNAUTHORIZED", httpStatus: 401 }
        : null;

  if (!errorType) return shape;

  return {
    ...shape,
    code: errorType.code,
    data: {
      ...shape.data,
      code: errorType.code,
      httpStatus: errorType.httpStatus,
    },
  };
};
const t = initTRPC.context<TRPCContext>().create({
  errorFormatter: (opts) => {
    return formatError(opts.shape, opts.error);
  },
  transformer: superjson,
});
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
