import { z } from "zod";

export const getSubjectGoalSchema = (currentAverage?: number) =>
  z.object({
    value: z.coerce
      .number()
      .min(
        currentAverage ? currentAverage + 1 : 0,
        currentAverage
          ? `Goal must be greater than current average (${currentAverage}%)`
          : undefined
      )
      .max(100),
    categoryId: z.string(),
    minimumScore: z.coerce.number().min(0).max(100),
  });
export type SubjectGoalSchema = z.infer<
  ReturnType<typeof getSubjectGoalSchema>
>;
