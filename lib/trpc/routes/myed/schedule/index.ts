import { timezonedDayJS } from "@/instances/dayjs";
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
    .query(async ({ input, ctx: { getMyEd } }) => {
      const currentDate = timezonedDayJS().startOf("day");
      const response = await getMyEd("schedule", input);
      return response;
    }),
});
