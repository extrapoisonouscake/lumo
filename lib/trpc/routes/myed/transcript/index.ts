import { getTrackedSchoolData } from "@/helpers/customizations";
import { hashString } from "@/helpers/hashString";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const transcriptRouter = router({
  getTranscriptEntries: authenticatedProcedure.query(
    async ({ ctx: { getMyEd } }) => {
      return await getMyEd("transcriptEntries");
    }
  ),
  getGraduationSummary: authenticatedProcedure.query(
    async ({ ctx: { getMyEd } }) => {
      return await getMyEd("graduationSummary");
    }
  ),
  getReports: authenticatedProcedure.query(
    async ({ ctx: { getMyEd, userId } }) => {
      const [reports, seenReportIds] = await Promise.all([
        getMyEd("reports"),
        getTrackedSchoolData(userId, "seenReportIds"),
      ]);
      let isShown = true;
      if (seenReportIds) {
        const oldHash = hashString(seenReportIds.join(","));
        const newHash = hashString(
          reports.map((report) => report.id).join(",")
        );
        isShown = oldHash !== newHash;
      }
      return { reports, isShown };
    }
  ),
});
