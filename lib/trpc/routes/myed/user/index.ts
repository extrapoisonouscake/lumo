import { getMyEd } from "@/parsing/myed/getMyEd";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const userRouter = router({
  getStudentDetails: authenticatedProcedure.query(async () => {
    return getMyEd("personalDetails");
  }),
});
