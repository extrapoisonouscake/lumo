import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { db } from "@/db";

import { SubjectGoal, tracked_school_data } from "@/db/schema";
import { getTrackedSchoolData } from "@/helpers/customizations";
import { submitUnknownSubjectsNames } from "@/parsing/myed/helpers";
import {
  Subject,
  SubjectSummary,
  SubjectTerm,
  SubjectYear,
  TermEntry,
} from "@/types/school";
import { eq, sql } from "drizzle-orm";
import { after } from "next/server";
import { z } from "zod";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";
import { updateSubjectLastAssignments } from "../../core/settings/helpers";
import { getSubjectGoalSchema } from "./public";
const subjectYearEnum = z.enum([
  "current",
  "previous",
] as const satisfies SubjectYear[]);
interface GetSubjectsResponse {
  terms: TermEntry[];
  subjects: { main: Subject[]; teacherAdvisory: Subject | null };
  isDerivedAllTerms?: boolean;
  customization?: {
    subjectsListOrder: string[];
    hiddenSubjects: string[];
  };
}

export interface GetSubjectInfoResponse extends SubjectSummary {
  goal?: SubjectGoal;
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
        getTrackedSchoolData(studentDatabaseId),
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
        .update(tracked_school_data)
        .set({
          subjectsListOrder: input.subjectsListOrder,
          hiddenSubjects: input.hiddenSubjects,
        })
        .where(eq(tracked_school_data.userId, studentDatabaseId));
    }),
  getSubjectInfo: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        year: subjectYearEnum,
      })
    )
    .query(async ({ input, ctx: { getMyEd, studentDatabaseId } }) => {
      const [result, trackedSchoolData] = await Promise.all([
        getMyEd("subjectSummary", input),
        getTrackedSchoolData(studentDatabaseId),
      ]);
      return {
        ...result,
        goal: trackedSchoolData?.subjectsGoals?.[input.id],
      };
    }),
  setSubjectGoal: authenticatedProcedure
    .input(
      z.object({
        subjectId: z.string(),
        goal: z.union([getSubjectGoalSchema(), z.undefined()]),
      })
    )
    .mutation(async ({ input, ctx: { studentDatabaseId } }) => {
      await db
        .update(tracked_school_data)
        .set({
          
            subjectsGoals:
              input.goal === undefined
                ? sql`COALESCE(${tracked_school_data.subjectsGoals}, '{}'::jsonb) - ${input.subjectId}`
                : sql`COALESCE(${tracked_school_data.subjectsGoals}, '{}'::jsonb) || ${JSON.stringify({ [input.subjectId]: input.goal })}::jsonb`,
          
        })
        .where(eq(tracked_school_data.userId, studentDatabaseId));
    }),
  getSubjectAssignments: authenticatedProcedure
    .input(
      z
        .object({
          term: z.enum(SubjectTerm).optional(),
          termId: z.string().optional(),
        })
        .partial()
        .extend({ id: z.string() })
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
        const [response, trackedSchoolData] = await Promise.all([
          getMyEd("subjectAssignments", {
            id,
            termId,
            term,
          }),
          getTrackedSchoolData(studentDatabaseId),
        ]);
        const trackedAssignments =
          trackedSchoolData?.subjectsWithAssignments?.[id]?.assignments;
          const assignmentsWithUpdatedDates=response.assignments.map((assignment)=>{
            const previousAssignment=trackedAssignments?.find((a)=>a.id===assignment.id);
            let assignmentToPrepare=assignment
            if(previousAssignment){
              if(previousAssignment.score!==assignment.score){
                assignmentToPrepare.updatedAt=new Date();
              }else{
              assignmentToPrepare.updatedAt=previousAssignment.updatedAt;
              }
            } else{
              if(!!trackedAssignments){//this means the data has been saved before and we can compare the dates safely
              assignmentToPrepare.updatedAt=new Date();
              }
            }

            return assignmentToPrepare
        })
        if (
          term ||
          (response.currentTermIndex &&
            termId === response.terms![response.currentTermIndex]?.id)
        ) {
          after(
            updateSubjectLastAssignments(
              {userId:studentDatabaseId,
              subjectId:id,
              newAssignments:assignmentsWithUpdatedDates,
            
            }
            )
          );
        }
        
        if (!trackedAssignments) {
          return response;
        }
        return {
          ...response,
          assignments: assignmentsWithUpdatedDates
        };
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
