import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const userRouter = router({
  getStudentDetails: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.getMyEd("personalDetails");
  }),
});
