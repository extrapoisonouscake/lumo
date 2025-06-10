import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./base";
import { deleteSession } from "./routes/myed/auth/helpers";

export const authenticatedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.studentId) {
      await deleteSession();
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx });
  }
);
