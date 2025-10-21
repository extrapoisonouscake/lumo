import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { db } from "@/db";

import { tracked_school_data } from "@/db/schema";
import { prepareAssignmentForDBStorage } from "@/lib/notifications";
import { submitUnknownSubjectsNames } from "@/parsing/myed/helpers";
import { Subject, SubjectTerm, SubjectYear, TermEntry } from "@/types/school";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { z } from "zod";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";
import { updateSubjectLastAssignments } from "../../core/settings/helpers";
const subjectYearEnum = z.enum([
  "current",
  "previous",
] as const satisfies SubjectYear[]);
export type SubjectWithVisibility = Subject & { isHidden?: boolean };
interface GetSubjectsResponse {
  terms: TermEntry[];
  subjects: { main: SubjectWithVisibility[]; teacherAdvisory: Subject | null };
  isDerivedAllTerms?: boolean;
  customization?: {
    subjectsListOrder: string[];
    hiddenSubjects: string[];
  };
}
export const subjectsRouter = router({
  getSubjects: authenticatedProcedure
    .input(
      z
        .object({
          isPreviousYear: z.boolean().optional().default(false),
          termId: z.string().optional(),
        })
        .optional()
        .default({ isPreviousYear: false })
    )
    .query(async ({ input, ctx: { getMyEd, studentDatabaseId } }) => {
      const [response, trackedSchoolData] = await Promise.all([
        getMyEd("subjects", input),
        db.query.tracked_school_data.findFirst({
          where: eq(tracked_school_data.userId, studentDatabaseId),
        }),
      ]);
      let result: GetSubjectsResponse;
      if (response.subjects.main.length === 0) {
        const allTermsResponse = await getMyEd("subjects", {
          isPreviousYear: input?.isPreviousYear,
          termId: MYED_ALL_GRADE_TERMS_SELECTOR,
        });
        result = {
          ...allTermsResponse,
          isDerivedAllTerms: true,
        };
      } else {
        result = response;
      }
      after(async () => {
        await submitUnknownSubjectsNames(
          result.subjects.main.map((subject) => subject.name.actual)
        );
      });

      if (!input.isPreviousYear) {
        if (
          trackedSchoolData?.subjectsListOrder &&
          trackedSchoolData.hiddenSubjects
        ) {
          const subjectsIds = result.subjects.main.map((subject) => subject.id);
          result.customization = {
            ...result.customization,
            subjectsListOrder: trackedSchoolData.subjectsListOrder,
            hiddenSubjects: trackedSchoolData.hiddenSubjects.filter(
              (subjectId) => subjectsIds.includes(subjectId)
            ),
          };
          result.subjects.main = result.subjects.main.map((subject) => ({
            ...subject,
            isHidden: trackedSchoolData.hiddenSubjects.includes(subject.id),
          }));
        }
      }
      return result;
    }),
  updateSubjectsCustomization: authenticatedProcedure
    .input(
      z.object({
        subjectsListOrder: z.array(z.string()),
        hiddenSubjects: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx: { studentDatabaseId } }) => {
      await db
        .insert(tracked_school_data)
        .values({
          userId: studentDatabaseId,
          subjectsListOrder: input.subjectsListOrder,
          hiddenSubjects: input.hiddenSubjects,
        })
        .onConflictDoUpdate({
          target: tracked_school_data.userId,
          set: {
            subjectsListOrder: input.subjectsListOrder,
            hiddenSubjects: input.hiddenSubjects,
          },
        });
    }),
  getSubjectInfo: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        year: subjectYearEnum,
      })
    )
    .query(async ({ input, ctx: { getMyEd } }) => {
      return getMyEd("subjectSummary", input);
    }),
  getSubjectAssignments: authenticatedProcedure
    .input(
      z
        .object({
          term: z.nativeEnum(SubjectTerm).optional(),
          termId: z.string().optional(),
        })
        .partial()
        .merge(z.object({ id: z.string() }))
        .refine(
          (data) => !!data.term || !!data.termId,
          "Either term or termId should be filled in."
        )
    )
    .query(
      async ({
        input: { id, termId, term },
        ctx: { getMyEd, studentDatabaseId },
      }) => {
        const response = await getMyEd("subjectAssignments", {
          id,
          termId,
          term,
        });
        if (
          term ||
          (response.currentTermIndex &&
            termId === response.terms![response.currentTermIndex]?.id)
        ) {
          after(
            updateSubjectLastAssignments(
              studentDatabaseId,
              id,
              response.assignments.map(prepareAssignmentForDBStorage)
            )
          );
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
  getSubjectAttendance: authenticatedProcedure
    .input(
      z.object({
        subjectId: z.string(),
        year: subjectYearEnum,
      })
    )
    .query(async ({ input, ctx: { getMyEd } }) => {
      return getMyEd("subjectAttendance", input);
    }),
  getAssignmentSubmissionState: authenticatedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
      })
    )
    .query(async ({ input, ctx: { getMyEd } }) => {
      return getMyEd("assignmentFileSubmissionState", input);
    }),

  deleteAssignmentSubmission: authenticatedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx: { getMyEd } }) => {
      return getMyEd("deleteAssignmentFile", input);
    }),
});
