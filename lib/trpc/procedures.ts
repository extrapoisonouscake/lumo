import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./base";
import { deleteSession } from "./routes/myed/auth/utils";

export const authenticatedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.myedUser) {
      await deleteSession();
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx });
  }
);
