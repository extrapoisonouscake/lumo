import { cookies } from "next/headers";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const userRouter = router({
  unsafe_getCredentials: authenticatedProcedure.query(async ({ ctx }) => {
    const cookieStore = await cookies();

    const credentials = cookieStore.get("credentials")?.value;
    return { credentials };
  }),
  getStudentDetails: authenticatedProcedure.query(async ({ ctx }) => {
    const details = await ctx.getMyEd("studentDetails");

    return details;
  }),
});
