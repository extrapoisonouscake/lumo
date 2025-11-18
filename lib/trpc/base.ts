import { MAINTENANCE_MODE_ERROR_MESSAGE } from "@/parsing/myed/getMyEd";
import { initTRPC } from "@trpc/server";

import superjson from "superjson";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter: (opts) => {
    const { shape, error } = opts;

    const isMaintenance = error.message === MAINTENANCE_MODE_ERROR_MESSAGE;
    return {
      ...shape,
      code: isMaintenance ? "SERVICE_UNAVAILABLE" : shape.code,
      data: {
        ...shape.data,
        code: isMaintenance ? "SERVICE_UNAVAILABLE" : shape.data.code,
        httpStatus: isMaintenance ? 503 : shape.data.httpStatus,
      },
    };
  },
  transformer: superjson,
});
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
