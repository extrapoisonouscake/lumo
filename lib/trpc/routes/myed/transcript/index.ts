import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const transcriptRouter = router({
  getTranscriptEntries: authenticatedProcedure.query(
    async ({ ctx: { getMyEd } }) => {
      return await getMyEd("transcriptEntries");
    }
  ),
});
