import { timezonedDayJS } from "@/instances/dayjs";
import { z } from "zod";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const scheduleRouter = router({
  getSchedule: authenticatedProcedure
    .input(
      z.object({
        date: z.date().optional(),
      })
    )
    .query(async ({ input, ctx: { getMyEd } }) => {
      const currentDate = timezonedDayJS().startOf("day");
      const response = getMyEd("schedule", {
        date: !currentDate.isSame(input.date, "day") ? input.date : undefined,
      });
      console.log({ response });
      return response;
    }),
});
