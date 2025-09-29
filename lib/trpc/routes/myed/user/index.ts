import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const userRouter = router({
  getStudentDetails: authenticatedProcedure.query(async ({ ctx }) => {
    const details = await ctx.getMyEd("personalDetails");

    return details;
  }),
});
