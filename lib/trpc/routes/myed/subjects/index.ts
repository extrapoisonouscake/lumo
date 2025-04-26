import { after } from "next/server";
import { z } from "zod";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";
import { updateSubjectLastAssignmentId } from "../../core/settings/helpers";

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
    .query(async ({ input, ctx: { getMyEd } }) => {
      return getMyEd("subjects", input);
    }),
  getSubjectInfo: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx: { getMyEd } }) => {
      return getMyEd("subjectSummary", input);
    }),
  getSubjectAssignments: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        termId: z.string().optional(),
      })
    )
    .query(
      async ({ input: { id, termId }, ctx: { getMyEd, studentHashedId } }) => {
        const response = await getMyEd("subjectAssignments", { id, termId });
        if (
          response.currentTermIndex &&
          (!termId || termId === response.terms[response.currentTermIndex]?.id)
        ) {
          const lastAssignmentId = response.assignments[0]?.id;

          if (lastAssignmentId) {
            after(
              updateSubjectLastAssignmentId(
                studentHashedId,
                id,
                lastAssignmentId
              )
            );
          }
        }
        return response;
      }
    ),
  getSubjectAssignment: authenticatedProcedure
    .input(
      z.object({
        subjectId: z.string(),
        assignmentId: z.string(),
      })
    )
    .query(async ({ input, ctx: { getMyEd } }) => {
      return getMyEd("subjectAssignment", input);
    }),
});
