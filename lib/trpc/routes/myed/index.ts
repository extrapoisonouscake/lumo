import { removeLineBreaks } from "@/helpers/removeLineBreaks";
import { fetchMyEd } from "@/instances/fetchMyEd";
import * as cheerio from "cheerio";
import { publicProcedure, router } from "../../base";
import { authRouter } from "./auth";
import { scheduleRouter } from "./schedule";
import { subjectsRouter } from "./subjects";
import { transcriptRouter } from "./transcript";
import { userRouter } from "./user";

export const myedRouter = router({
  user: userRouter,
  schedule: scheduleRouter,
  subjects: subjectsRouter,
  auth: authRouter,
  transcript: transcriptRouter,
  health: publicProcedure.query(async () => {
    try {
      await fetchMyEd("/");
      return { isHealthy: true };
    } catch (e) {
      let message;
      if (e instanceof Response && e.status === 502) {
        const $ = cheerio.load(await e.text());
        message = removeLineBreaks($(".maintenanceBox p").text().trim());
      }
      return { isHealthy: false, message };
    }
  }),
});
