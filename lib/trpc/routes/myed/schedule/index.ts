import { z } from "zod";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const scheduleRouter = router({
  getSchedule: authenticatedProcedure
    .input(
      z.object({
        day: z.string(), //in myed format
      })
    )
    .query(async ({ input, ctx: { studentDatabaseId, getMyEd } }) => {
      console.log(studentDatabaseId);
      const response = await getMyEd("schedule", input);
      return response;
    }),
});
