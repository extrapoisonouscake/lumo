import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const transcriptRouter = router({
  getTranscriptEntries: authenticatedProcedure.query(
    async ({ ctx: { getMyEd } }) => {
      return await getMyEd("transcriptEntries");
    }
  ),
  getCreditSummary: authenticatedProcedure.query(
    async ({ ctx: { getMyEd } }) => {
      return await getMyEd("creditSummary");
    }
  ),
  getGraduationSummary: authenticatedProcedure.query(
    async ({ ctx: { getMyEd } }) => {
      return await getMyEd("graduationSummary");
    }
  ),
});
