import { getMyEd } from "@/parsing/myed/getMyEd";
import { z } from "zod";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const subjectsRouter = router({
  getSubjects: authenticatedProcedure
    .input(
      z
        .object({
          isPreviousYear: z.boolean().optional().default(false),
          termId: z.string().optional(),
        })
        .optional()
        .default({})
    )
    .query(async ({ input }) => {
      return getMyEd("subjects", input);
    }),
  getSubjectInfo: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getMyEd("subjectSummary", input);
    }),
  getSubjectAssignments: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        termId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getMyEd("subjectAssignments", input);
    }),
  getSubjectAssignment: authenticatedProcedure
    .input(
      z.object({
        subjectId: z.string(),
        assignmentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getMyEd("subjectAssignment", input);
    }),
});
