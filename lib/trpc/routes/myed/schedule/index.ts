import { submitUnknownSubjectsNames } from "@/parsing/myed/helpers";
import { after } from "next/server";
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
      const response = await getMyEd("schedule", input);
      after(async () => {
        if (!("knownError" in response)) {
          await submitUnknownSubjectsNames(
            response.subjects
              .filter((subject) => !subject.isSpareBlock)
              .map((subject) => subject.name.actual)
          );
        }
      });
      return response;
    }),
});
