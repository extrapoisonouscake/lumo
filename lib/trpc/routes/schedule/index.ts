import { timezonedDayJS } from "@/instances/dayjs";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { z } from "zod";
import { router } from "../../base";
import { authenticatedProcedure } from "../../procedures";

export const scheduleRouter = router({
  getSchedule: authenticatedProcedure
    .input(
      z.object({
        date: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const currentDate = timezonedDayJS().startOf("day");
      return getMyEd("schedule", {
        date: !currentDate.isSame(input.date, "day") ? input.date : undefined,
      });
    }),
});
