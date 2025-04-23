import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./base";

export const atLeastGuestProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.isGuest && !ctx.studentId)
      throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx });
  }
);

export const guestProcedure = atLeastGuestProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.isGuest) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx });
  }
);

export const authenticatedProcedure = atLeastGuestProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.isGuest === true) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx });
  }
);
